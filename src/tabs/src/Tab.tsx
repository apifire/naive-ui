import {
  h,
  defineComponent,
  inject,
  computed,
  mergeProps,
  Fragment,
  VNode,
  VNodeChild,
  PropType
} from 'vue'
import { AddIcon, MoreIcon } from '../../_internal/icons'
import { NBaseClose, NBaseIcon } from '../../_internal'
import { render, omit } from '../../_utils'
import type { ExtractPublicPropTypes } from '../../_utils'
import { OnBeforeLeaveImpl, tabsInjectionKey } from './interface'
import { tabPaneProps } from './TabPane'

export const tabProps = {
  internalLeftPadded: Boolean,
  internalAddable: Boolean,
  internalMoreable: Boolean,
  renderMoreIcon: [String, Number, Object, Function] as PropType<
  String | Number | VNode | (() => VNodeChild)
  >,
  renderCloseIcon: [String, Number, Object, Function] as PropType<
  String | Number | VNode | (() => VNodeChild)
  >,
  closeClass: [String, Function] as PropType<
  string | ((data: String | Number) => String)
  >,
  internalCreatedByPane: Boolean,
  ...omit(tabPaneProps, ['displayDirective'])
} as const

export type TabProps = ExtractPublicPropTypes<typeof tabProps>

export default defineComponent({
  __TAB__: true,
  inheritAttrs: false,
  name: 'Tab',
  props: tabProps,
  setup (props) {
    const {
      mergedClsPrefixRef,
      valueRef,
      typeRef,
      closableRef,
      tabStyleRef,
      tabChangeIdRef,
      onBeforeLeaveRef,
      triggerRef,
      handleAdd,
      handleMore,
      activateTab,
      handleClose
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } = inject(tabsInjectionKey)!
    return {
      trigger: triggerRef,
      mergedClosable: computed(() => {
        if (props.internalAddable) return false
        if (props.internalMoreable) return false
        const { closable } = props
        if (closable === undefined) return closableRef.value
        return closable
      }),
      style: tabStyleRef,
      clsPrefix: mergedClsPrefixRef,
      value: valueRef,
      type: typeRef,
      handleClose (e: MouseEvent) {
        e.stopPropagation()
        if (props.disabled) return
        handleClose(props.name)
      },
      activateTab () {
        if (props.disabled) return
        if (props.internalAddable) {
          handleAdd()
          return
        }
        if (props.internalMoreable) {
          handleMore()
          return
        }
        const { name: nameProp } = props
        const id = ++tabChangeIdRef.id
        if (nameProp !== valueRef.value) {
          const { value: onBeforeLeave } = onBeforeLeaveRef
          if (!onBeforeLeave) {
            activateTab(nameProp)
          } else {
            void Promise.resolve(
              (onBeforeLeave as OnBeforeLeaveImpl)(props.name, valueRef.value)
            ).then((allowLeave) => {
              if (allowLeave && tabChangeIdRef.id === id) {
                activateTab(nameProp)
              }
            })
          }
        }
      }
    }
  },
  render () {
    const {
      internalAddable,
      internalMoreable,
      renderMoreIcon,
      renderCloseIcon,
      closeClass,
      clsPrefix,
      name,
      disabled,
      label,
      tab,
      value,
      mergedClosable,
      style,
      trigger,
      $slots: { default: defaultSlot }
    } = this
    const mergedTab = label ?? tab
    return (
      <div
        class={
          `${clsPrefix}-tabs-tab-wrapper` +
          (internalMoreable || internalAddable
            ? ` ${clsPrefix}-tabs-tab-wrapper-operation`
            : ` ${clsPrefix}-tabs-tab-wrapper-item`) +
          (value === name ? ` ${clsPrefix}-tabs-tab-wrapper--active` : '')
        }
      >
        {this.internalLeftPadded ? (
          <div class={`${clsPrefix}-tabs-tab-pad`} />
        ) : null}
        <div
          key={name}
          data-name={name}
          data-disabled={disabled ? true : undefined}
          {...mergeProps(
            {
              class: [
                `${clsPrefix}-tabs-tab`,
                value === name && `${clsPrefix}-tabs-tab--active`,
                disabled && `${clsPrefix}-tabs-tab--disabled`,
                mergedClosable && `${clsPrefix}-tabs-tab--closable`,
                internalAddable && `${clsPrefix}-tabs-tab--addable`,
                internalMoreable && `${clsPrefix}-tabs-tab--moreable`
              ],
              onClick: trigger === 'click' ? this.activateTab : undefined,
              onMouseenter: trigger === 'hover' ? this.activateTab : undefined,
              style: internalAddable || internalMoreable ? undefined : style
            },
            this.internalCreatedByPane
              ? ((this.tabProps || {}) as any)
              : this.$attrs
          )}
        >
          <span class={`${clsPrefix}-tabs-tab__label`}>
            {internalAddable ? (
              <>
                <div class={`${clsPrefix}-tabs-tab__height-placeholder`}>
                  &nbsp;
                </div>
                <NBaseIcon clsPrefix={clsPrefix}>
                  {{
                    default: () => <AddIcon />
                  }}
                </NBaseIcon>
              </>
            ) : internalMoreable && renderMoreIcon ? (
              <>
                <div class={`${clsPrefix}-tabs-tab__height-placeholder`}>
                  &nbsp;
                </div>
                {render(renderMoreIcon)}
              </>
            ) : internalMoreable ? (
              <>
                <div class={`${clsPrefix}-tabs-tab__height-placeholder`}>
                  &nbsp;
                </div>
                <NBaseIcon clsPrefix={clsPrefix}>
                  {{
                    default: () => <MoreIcon />
                  }}
                </NBaseIcon>
              </>
            ) : defaultSlot ? (
              defaultSlot()
            ) : typeof mergedTab === 'object' ? (
              mergedTab // VNode
            ) : (
              render(mergedTab ?? name)
            )}
          </span>
          {mergedClosable && this.type === 'card' && renderCloseIcon ? (
            render(renderCloseIcon, name, this.handleClose)
          ) : mergedClosable && this.type === 'card' ? (
            <NBaseClose
              clsPrefix={clsPrefix}
              class={
                `${clsPrefix}-tabs-tab__close` +
                (typeof closeClass === 'string'
                  ? ` ${closeClass}`
                  : typeof closeClass === 'function'
                    ? ' ' + (closeClass(name) as string)
                    : '')
              }
              onClick={this.handleClose}
              disabled={disabled}
            />
          ) : null}
        </div>
      </div>
    )
  }
})
