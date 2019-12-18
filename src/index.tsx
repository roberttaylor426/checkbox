import React, {
  useState,
  useCallback,
  useMemo,
  useContext,
  CSSProperties,
} from 'react'
import VisuallyHidden from '@accessible/visually-hidden'
import useSwitch from '@react-hook/switch'
import {useId} from '@reach/auto-id'
import clsx from 'clsx'

const __DEV__ =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

export interface CheckboxContextValue {
  checked: boolean
  check: () => void
  uncheck: () => void
  toggle: () => void
  focused: boolean
  id: string
}

export interface CheckboxControls {
  check: () => void
  uncheck: () => void
  toggle: () => void
}

// @ts-ignore
export const CheckboxContext = React.createContext<CheckboxContextValue>({}),
  useCheckbox = () => useContext<CheckboxContextValue>(CheckboxContext),
  useChecked = () => useCheckbox().checked,
  useFocused = () => useCheckbox().focused,
  useControls = (): CheckboxControls =>
    Object.entries(useCheckbox()).reduce((prev, [key, value]) => {
      if (typeof value === 'function') prev[key] = value
      return prev
    }, {}) as CheckboxControls

export interface CheckboxProps {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  children?:
    | React.ReactNode
    | React.ReactNode[]
    | ((context: CheckboxContextValue) => React.ReactNode)
  [property: string]: any
}

// @ts-ignore
export const Checkbox: React.FC<CheckboxProps> = React.forwardRef<
  JSX.Element | React.ReactElement,
  CheckboxProps
>(({id, checked, defaultChecked, children, ...props}, ref: any) => {
  const [switchChecked, toggle] = useSwitch(defaultChecked)
  const [focused, setFocused] = useState<boolean>(false)
  checked = checked === void 0 || checked === null ? switchChecked : checked
  id = `checkbox--${useId(id)}`
  const context = useMemo(
    () => ({
      checked,
      check: toggle.on,
      uncheck: toggle.off,
      toggle,
      focused,
      id,
    }),
    [id, checked, focused, toggle, toggle.on, toggle.off]
  )
  // @ts-ignore
  children = typeof children === 'function' ? children(context) : children
  return (
    <CheckboxContext.Provider value={context}>
      <VisuallyHidden>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          ref={ref}
          onChange={e => {
            props.onChange?.(e)
            toggle()
          }}
          onFocus={e => {
            props.onFocus?.(e)
            setFocused(true)
          }}
          onBlur={e => {
            props.onBlur?.(e)
            setFocused(false)
          }}
          {...props}
        />
      </VisuallyHidden>

      {children}
    </CheckboxContext.Provider>
  )
})

export interface CheckedProps {
  children: React.ReactNode
}

// @ts-ignore
export const Checked: React.FC<CheckedProps> = ({children}) =>
  useChecked() ? children : null

export interface UncheckedProps {
  children: React.ReactNode
}

// @ts-ignore
export const Unchecked: React.FC<UncheckedProps> = ({children}) =>
  !useChecked() ? children : null

export interface CheckmarkProps {
  checkedClass?: string
  uncheckedClass?: string
  checkedStyle?: CSSProperties
  uncheckedStyle?: CSSProperties
  children: JSX.Element | React.ReactElement
}

export const Checkmark: React.FC<CheckmarkProps> = ({
  children,
  checkedClass = 'checkbox--checked',
  uncheckedClass,
  checkedStyle,
  uncheckedStyle,
}) => {
  const checked = useChecked()
  return React.cloneElement(children, {
    className:
      clsx(children.props.className, checked ? checkedClass : uncheckedClass) ||
      void 0,
    style: Object.assign(
      {},
      children.props.style,
      checked ? checkedStyle : uncheckedStyle
    ),
  })
}

export interface ToggleProps {
  children: JSX.Element | React.ReactElement
}

export const Toggle: React.FC<ToggleProps> = ({children}) => {
  const {toggle} = useControls()
  return React.cloneElement(children, {
    onClick: useCallback(
      e => {
        children.props.onClick?.(e)
        toggle()
      },
      [toggle, children.props.onClick]
    ),
  })
}

/* istanbul ignore next */
if (__DEV__) {
  Checkbox.displayName = 'Checkbox'
  Checked.displayName = 'Checked'
  Unchecked.displayName = 'Unchecked'
  Toggle.displayName = 'Toggle'
}
