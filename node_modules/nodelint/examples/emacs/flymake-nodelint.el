;; On-the-fly syntax checking of javascript using nodelint to run JSLint.
;;
;; Changes to this file have been released into the Public Domain.
;; Adapted from http://www.emacswiki.org/emacs/FlymakeJavaScript
;;
;; Installation:
;;
;; Put this in your load-path, then add the following to your .emacs.
;; You substitude espresso-mode-hook for javascript-mode-hook if you
;; use espresso or js2-mode-hook if using js2-mode.
;;
;; (require 'flymake-nodelint)
;; (add-hook 'javascript-mode-hook
;;           (lambda () (flymake-mode t)))
;;
;; Make sure env can find node in your $PATH

(require 'flymake)

(setq flymake-log-level 3)

(defun flymake-nodelint-init ()
  (let* ((temp-file (flymake-init-create-temp-buffer-copy
                    'flymake-create-temp-inplace))
         (local-file (file-relative-name
                     temp-file
                     (file-name-directory buffer-file-name))))
         (list "nodelint" (list local-file))))

;; needs debugging
(setq flymake-allowed-file-name-masks
      (cons '(".+\\.js$"
              flymake-nodelint-init
              flymake-simple-cleanup
              flymake-get-real-file-name)
              flymake-allowed-file-name-masks))

;; using this in lieu of the above
;;(eval-after-load "flymake"
;;  '(progn
;;          (add-to-list 'flymake-allowed-file-name-masks
;;                       '("\\.js\\'" flymake-nodelint-init))))

(setq flymake-err-line-patterns
      (cons '("^Lint at line \\([[:digit:]]+\\) character \\([[:digit:]]+\\): \\(.+\\)$"
              nil 1 2 3)
              flymake-err-line-patterns))

(add-hook 'find-file-hook 'flymake-find-file-hook)

(provide 'flymake-nodelint)

