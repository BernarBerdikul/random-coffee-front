import React, { PropsWithChildren } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn ghost" onClick={onClose} aria-label="Закрыть">Закрыть</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

