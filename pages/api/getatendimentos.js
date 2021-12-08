import database from './_database.js'

export default async ( req, res ) => {

    let atendimentos = {
        'Em aberto': {},
        'Feitos': {},
        'Tecnicos': {}
    }

    let cadastros = await database.collection( '/cadastros/' ).where( 'ativo', '==', true ).orderBy( 'nomefantasia' ).get()
    let dados = await database.collection( '/atendimentos/' ).get()
    dados.forEach( dado => {

        let atendimento = dado.data()
        atendimento.id = dado.id

        if ( atendimento.feito ) { atendimentos[ 'Feitos' ] = { ...atendimentos[ 'Feitos' ], [ atendimento.id ]: atendimento } }
        else if ( atendimento.responsavel === '' ) { atendimentos[ 'Em aberto' ] = { ...atendimentos[ 'Em aberto' ], [ atendimento.id ]: atendimento } }
        else { atendimentos[ 'Tecnicos' ][ atendimento.responsavel ] = { ...atendimentos[ 'Tecnicos' ][ atendimento.responsavel ], [ atendimento.id ]: atendimento } }
    } )

    //atendimentos[ 'Tecnicos' ][ 'Tec1' ] = test
    //atendimentos[ 'Tecnicos' ][ 'Tec2' ] = test1
    //atendimentos[ 'Feitos' ] = test
    //define que os dados ficarão em cache por no minimo 60 segundos, depois revalida tudo novamente
    res.setHeader( 'Cache-Control', 's-maxage=3600, stale-while-revalidade' )
    res.status( 200 ).send( { atendimentos, cadastros } )
}
/*
let test = {
    "8irckIPbEIfXjaSADTUu": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Mundo Cão",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": true,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "1" ],
        "id": "8irckIPbEIfXjaSADTUu"
    },
    "7irckIPbEIfXjaSADTUu": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Mundo Eletrônico",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": true,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "2" ],
        "id": "7irckIPbEIfXjaSADTUu"
    },
    "6irckIPbEIfXjaSADTUu": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Cliente de teste",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "3" ],
        "id": "6irckIPbEIfXjaSADTUu"
    },
    "5irckIPbEIfXjaSADTUu": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Algum cliente diferente",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "4" ],
        "id": "5irckIPbEIfXjaSADTUu"
    },
    "4irckIPbEIfXjaSADTUu": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "teste 12987",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "5" ],
        "id": "4irckIPbEIfXjaSADTUu"
    },
    "3irckIPbEIfXjaSADTUu": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Cliente X",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "6" ],
        "id": "3irckIPbEIfXjaSADTUu"
    },
}
let test1 = {
    "8irckIPbEIfXjaSADTUu": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Cliente B",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "1" ],
        "id": "8irckIPbEIfXjaSADTUu"
    },
    "7irckIPbEIfXjaSADTUe": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Cliente com acento no Á",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "2" ],
        "id": "7irckIPbEIfXjaSADTUe"
    },
    "6irckIPbEIfXjaSADTUd": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Cliente com til ão",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": true,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "3" ],
        "id": "6irckIPbEIfXjaSADTUd"
    },
    "5irckIPbEIfXjaSADTUc": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Mundo Eletrônico Repetido",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "4" ],
        "id": "5irckIPbEIfXjaSADTUc"
    },
    "4irckIPbEIfXjaSADTUb": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Zxceds",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "5" ],
        "id": "4irckIPbEIfXjaSADTUb"
    },
    "3irckIPbEIfXjaSADTUa": {
        "cliente": {
            "endereco": {
                "estado": "SC",
                "numero": "1825",
                "bairro": "Jaraguá Esquerdo",
                "complemento": "Sala 01",
                "cidade": "Jaraguá do Sul",
                "rua": "João Januário Ayroso",
                "cep": "89253-295"
            },
            "nomefantasia": "Mundo Eletrônico",
            "razaosocial": "Mundo Eletrônico Locadora De Equipamentos EIRELI", 'cpfcnpj': '23.571.140/0001-15',
            "contato": {
                "email": "suporte@grupomundoeletronico.com.br",
                "celular": "(47) 99964-9667",
                "telefone": "(47) 3370-1881"
            }
        },
        "feito": false,
        "responsavel": "Carlos",
        "dados": {
            "fim": {
                "_seconds": 1614687960,
                "_nanoseconds": 0
            },
            "inicio": {
                "_seconds": 1614776580,
                "_nanoseconds": 0
            }
        },
        "motivo": [ "6" ],
        "id": "3irckIPbEIfXjaSADTUa"
    },
}
*/