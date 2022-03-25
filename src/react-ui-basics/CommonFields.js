export const createAccessor = (field) => (o) => {
    return o[field];
}

export const width = createAccessor('width')
export const height = createAccessor('height')
export const top = createAccessor('top')
export const left = createAccessor('left')
export const style = createAccessor('style')
export const length = createAccessor('length')
export const pageX = createAccessor('pageX')
export const pageY = createAccessor('pageY')
export const value = createAccessor('value')
export const clientHeight = createAccessor('clientHeight')
export const clientWidth = createAccessor('clientWidth')
export const scrollTop = createAccessor('scrollTop')
export const scrollLeft = createAccessor('scrollLeft')
export const target = createAccessor('target')
export const data = createAccessor('data')
export const state = createAccessor('state')
export const props = createAccessor('props')