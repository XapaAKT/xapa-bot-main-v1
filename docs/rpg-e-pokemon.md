# RPG e Pokémon

## RPG

Use `/rpghelp` dentro de um grupo com o RPG ativo para abrir o guia completo no próprio WhatsApp.

Administradores controlam o modo por grupo:

- `/rpg on`, `/rpg off` e `/rpg status`
- `/rpgclasse guerreiro|mago|cacador`
- `/rpgprofissao ferreiro|alquimista|coletor|mercador`
- `/rpgperfil`, `/rpgexplorar`, `/rpginventario`
- `/rpgbatalha slime|goblin|lobo|dragao`
- `/rpgatacar` e `/rpgfugir`
- `/rpgloja` e `/rpgcomprar espada|armadura|cajado|pocao`

O progresso fica salvo em `database/rpgState.json` e as recompensas usam a carteira da economia existente.

## Comandos SUS

Administradores podem controlar os comandos em `member/funny` com:

- `/sus on`
- `/sus off`
- `/sus status`

O padrão é desativado por grupo.

## Pokémon

`/pokemon` e `/pokedex` agora exibem atalhos interativos para loja, pesca e Pokédex, além dos comandos existentes de packs, coleção e venda.
