import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'

import MenuIcon from '../../../../Icons/MenuIcon'
import { Botao } from '../../styles'

import * as S from './styles'

function Impressoras ( props ) {
    const { colors } = useContext( ThemeContext )
    //variaveis alteráveis pelo usuário
    const [ impressora, setImpressora ] = useState( props.impressora )

    useEffect( () => {
        setImpressora( props.impressora )
    }, [ props.cadastro ] )

    function ativarImpressora () {
        props.setObjectData( `impressoras.${ impressora.serial }.contabilizar`, !impressora.contabilizar )
    }

    return (
        <S.Container>
            <S.Titulo>
                <S.TituloContainer>
                    <S.TituloModelo>{ impressora.modelo }</S.TituloModelo>
                    <S.TituloSerial>{ impressora.serial }</S.TituloSerial>
                </S.TituloContainer>
                <S.TituloSubcontainer>
                    <Botao title={ 'Contabilizar' } onClick={ () => ativarImpressora() } hover={ colors.azul }>
                        <MenuIcon name={ 'status_ok' } margin='0' />
                    </Botao>
                </S.TituloSubcontainer>
            </S.Titulo>

        </S.Container>
    )
}

export default Impressoras