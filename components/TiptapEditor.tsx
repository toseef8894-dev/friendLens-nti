'use client'

import { useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold, Italic, List, ListOrdered, Quote,
    Undo, Redo, Heading2, Heading3, Link as LinkIcon, X, Check,
} from 'lucide-react'

interface Props {
    content: string
    onChange: (html: string) => void
    placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder = 'Write your post content here...' }: Props) {
    const [showLinkPanel, setShowLinkPanel] = useState(false)
    const [linkInput, setLinkInput] = useState('')
    const linkInputRef = useRef<HTMLInputElement>(null)

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
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }
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

    if (!editor) return null

    const btn = (active: boolean, disabled = false) =>
        `p-1.5 rounded-lg transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${
            active
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`

    const divider = <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-colors">

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
