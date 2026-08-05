interface TextBoxProps {
  text: string
  onTextChange: (text: string) => void
  id?: string
  autoFocus?: boolean
}

export function TextBox({ text, onTextChange, id = 'paste-text', autoFocus = false }: TextBoxProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Cole seu texto aqui
      </label>
      <textarea
        id={id}
        name="paste-text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Cole seu texto aqui..."
        rows={10}
        autoFocus={autoFocus}
        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300 text-base resize-y min-h-[240px] shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600"
      />
      <div className="flex justify-end mt-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
          {text.length} caractere{text.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
