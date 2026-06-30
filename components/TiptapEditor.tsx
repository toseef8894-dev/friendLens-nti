'use client'

import { useState, useRef } from 'react'
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
    Bold, Italic, List, ListOrdered, Quote,
    Undo, Redo, Heading2, Heading3, Link as LinkIcon,
    X, Check, ImageIcon, Loader2, Trash2,
} from 'lucide-react'

// Fix 8 — hoisted to module level so they are not recreated on every render
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const SAFE_EXTS: Record<string, string> = {
    jpg: 'jpg', jpeg: 'jpg', png: 'png', gif: 'gif', webp: 'webp',
}
const MAX_SIZE_MB = 5

// ── Custom image node view ─────────────────────────────────────

function ImageNodeView({ node, deleteNode }: NodeViewProps) {
    const [loaded, setLoaded] = useState(false)       // Fix 12
    const [confirmDelete, setConfirmDelete] = useState(false) // Fix 4
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const src = node.attrs.src as string
            const path = src.split('/blog-images/')[1]
            if (path) {
                const supabase = createClient()
                const { error } = await supabase.storage.from('blog-images').remove([path])
                if (error) {
                    toast.error('Could not delete image from storage.')
                    return
                }
            }
            deleteNode()
        } catch {
            toast.error('Failed to delete image.')
        } finally {
            setIsDeleting(false)
            setConfirmDelete(false)
        }
    }

    return (
        <NodeViewWrapper className="relative my-4 group/img block">
            {/* Fix 12 — skeleton while image loads */}
            {!loaded && (
                <div className="w-full aspect-video bg-gray-100 rounded-xl animate-pulse" />
            )}
            <img
                src={node.attrs.src as string}
                alt={(node.attrs.alt as string) || ''}
                className={`rounded-xl max-w-full h-auto ${loaded ? '' : 'hidden'}`}
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
            />

            {/* Fix 1 + 4 — always visible on mobile, hover-only on desktop; two-step confirm */}
            {!confirmDelete ? (
                <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    title="Delete image"
                    className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md"
                >
                    <Trash2 size={14} />
                </button>
            ) : (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-xl shadow-lg border border-gray-200 p-1.5">
                    <span className="text-xs text-gray-700 font-medium px-1">Delete?</span>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {isDeleting && <Loader2 size={11} className="animate-spin" />}
                        Yes
                    </button>
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}
        </NodeViewWrapper>
    )
}

// ── Editor component ──────────────────────────────────────────

interface Props {
    content: string
    onChange: (html: string) => void
    placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder = 'Write your post content here...' }: Props) {
    const [showLinkPanel, setShowLinkPanel] = useState(false)
    const [linkInput, setLinkInput] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const linkInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'text-indigo-600 underline',
                },
            }),
            // Fix 7 — removed redundant HTMLAttributes (ignored when custom NodeView is used)
            ImageExtension.extend({
                addNodeView() {
                    return ReactNodeViewRenderer(ImageNodeView)
                },
            }),
            Placeholder.configure({ placeholder }),
        ],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-gray max-w-none min-h-[360px] px-4 py-3 focus:outline-none text-sm text-gray-900',
            },
        },
    })

    // ── Link panel ────────────────────────────────────────────

    function openLinkPanel() {
        if (!editor) return
        const existing = editor.getAttributes('link').href as string | undefined
        setLinkInput(existing ?? '')
        setShowLinkPanel(true)
        setTimeout(() => linkInputRef.current?.focus(), 0)
    }

    function applyLink() {
        if (!editor) return
        const url = linkInput.trim()
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            closeLinkPanel()
            return
        }
        // Fix 2 — block javascript: and other dangerous protocols
        if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
            toast.error('Only http, https or mailto links are allowed.')
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        toast.success('Link applied.')  // Fix 14
        closeLinkPanel()
    }

    function removeLink() {
        editor?.chain().focus().unsetLink().run()
        closeLinkPanel()
    }

    function closeLinkPanel() {
        setShowLinkPanel(false)
        setLinkInput('')
    }

    function handleLinkKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') { e.preventDefault(); applyLink() }
        if (e.key === 'Escape') { e.preventDefault(); closeLinkPanel() }
    }

    // Fix 6 — close link panel when focus leaves the editor container entirely
    function handleEditorBlur(e: React.FocusEvent) {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            closeLinkPanel()
        }
    }

    // ── Image upload ──────────────────────────────────────────

    async function handleImageFile(file: File) {
        if (!editor) return
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Only JPG, PNG, GIF and WebP images are allowed.')
            return
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be under ${MAX_SIZE_MB}MB.`)
            return
        }

        // Fix 11 — sanitise extension via safe whitelist
        const rawExt = file.name.split('.').pop()?.toLowerCase() ?? ''
        const ext = SAFE_EXTS[rawExt] ?? 'jpg'

        setIsUploading(true)
        try {
            const supabase = createClient()
            const path = `${crypto.randomUUID()}.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(path, file, { cacheControl: '31536000', upsert: false })

            if (uploadError) {
                toast.error(`Upload failed: ${uploadError.message}`)
                return
            }

            const { data } = supabase.storage.from('blog-images').getPublicUrl(path)

            // Fix 5 — if editor rejects the insert, clean up the orphaned file
            const inserted = editor.chain().focus().setImage({ src: data.publicUrl }).run()
            if (!inserted) {
                await supabase.storage.from('blog-images').remove([path])
                toast.error('Could not insert image into the editor.')
            }
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Fix 3 — void to surface as unhandled rejection rather than silently swallowing
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) void handleImageFile(file)
    }

    // Fix 9 — drag-and-drop image support
    function handleDrop(e: React.DragEvent) {
        const file = e.dataTransfer.files?.[0]
        if (file?.type.startsWith('image/')) {
            e.preventDefault()
            void handleImageFile(file)
        }
    }

    // Fix 10 — clipboard paste image support
    function handlePaste(e: React.ClipboardEvent) {
        const file = e.clipboardData.files?.[0]
        if (file?.type.startsWith('image/')) {
            e.preventDefault()
            void handleImageFile(file)
        }
    }

    const btn = (active: boolean, disabled = false) =>
        `p-1.5 rounded-lg transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${
            active
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`

    const divider = <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

    // Fix 13 — skeleton while Tiptap initialises
    if (!editor) {
        return (
            <div className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-10 bg-gray-50 border-b border-gray-200" />
                <div className="min-h-[360px] bg-white" />
            </div>
        )
    }

    return (
        <div
            className="rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-colors"
            onBlurCapture={handleEditorBlur}  // Fix 6
            onDrop={handleDrop}               // Fix 9
            onDragOver={e => e.preventDefault()}
            onPaste={handlePaste}             // Fix 10
        >
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                <button type="button" title="Bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={btn(editor.isActive('bold'))}>
                    <Bold size={15} />
                </button>
                <button type="button" title="Italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={btn(editor.isActive('italic'))}>
                    <Italic size={15} />
                </button>

                {divider}

                <button type="button" title="Heading 2"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={btn(editor.isActive('heading', { level: 2 }))}>
                    <Heading2 size={15} />
                </button>
                <button type="button" title="Heading 3"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={btn(editor.isActive('heading', { level: 3 }))}>
                    <Heading3 size={15} />
                </button>

                {divider}

                <button type="button" title="Bullet list"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={btn(editor.isActive('bulletList'))}>
                    <List size={15} />
                </button>
                <button type="button" title="Numbered list"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={btn(editor.isActive('orderedList'))}>
                    <ListOrdered size={15} />
                </button>
                <button type="button" title="Blockquote"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={btn(editor.isActive('blockquote'))}>
                    <Quote size={15} />
                </button>

                {divider}

                <button type="button" title="Link"
                    onClick={openLinkPanel}
                    className={btn(editor.isActive('link') || showLinkPanel)}>
                    <LinkIcon size={15} />
                </button>

                <button type="button" title="Insert image"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className={btn(false, isUploading)}>
                    {isUploading
                        ? <Loader2 size={15} className="animate-spin" />
                        : <ImageIcon size={15} />
                    }
                </button>

                {divider}

                <button type="button" title="Undo"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className={btn(false, !editor.can().undo())}>
                    <Undo size={15} />
                </button>
                <button type="button" title="Redo"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className={btn(false, !editor.can().redo())}>
                    <Redo size={15} />
                </button>
            </div>

            {/* Link panel */}
            {showLinkPanel && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
                    <LinkIcon size={14} className="text-gray-400 shrink-0" />
                    <input
                        ref={linkInputRef}
                        type="url"
                        value={linkInput}
                        onChange={e => setLinkInput(e.target.value)}
                        onKeyDown={handleLinkKeyDown}
                        placeholder="https://example.com"
                        className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    />
                    <button type="button" onClick={applyLink} title="Apply"
                        className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0">
                        <Check size={14} />
                    </button>
                    {editor.isActive('link') && (
                        <button type="button" onClick={removeLink}
                            className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                            Remove
                        </button>
                    )}
                    <button type="button" onClick={closeLinkPanel} title="Cancel"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Editor area */}
            <EditorContent editor={editor} />
        </div>
    )
}
