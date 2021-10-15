import light from '../styles/themes/light'
import dark from '../styles/themes/dark'

export function toggleTheme() {
    setTheme(theme.title === 'light' ? dark : light)
}