import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'

import MenuIcon from '../../../../Icons/MenuIcon'
import { Botao } from '../../styles'

import * as S from './styles'

function Impressoras ( props ) {
    const { colors } = useContext( ThemeContext )
    //variaveis alteráveis pelo usuário
    const impressora = props.impressora

    return (
        <S.Container>
            <S.Titulo>
                <S.TituloContainer>
                    <S.TituloModelo>{ impressora.modelo }</S.TituloModelo>
                    <S.TituloSerial>{ impressora.serial }</S.TituloSerial>
                </S.TituloContainer>
            </S.Titulo>
        </S.Container>
    )
}

export default Impressoras