import { Bot } from "./interfaces";

export const BOTS_LIST: Bot[] = [
    {name: "Bot Alice", personality: 0},
    {name: "Bot Bob", personality: 1},
    {name: "Bot Oto", personality: 2}
]

export const BOT_START_MESSAGES = {
    0: 'Je commence! Bonne chance tout le monde!',
    1: 'Notre équipe va gagner, c\'est certain',
    2: 'Je vais vous démolir!'
}

export const BOT_GUESS_MESSAGE = {
    0: 'Bravo! Je le savais que tu y arriveras!',
    1: 'Bien joué.',
    2: 'Enfin!'
}

export const BOT_OTHER_GUESS_MESSAGE = {
    0: 'On l\'aura la prochaine fois!',
    1: 'Allez, il faut qu\'on pousse plus fort.',
    2: 'Mon partenaire est inutile...'
}

export const BOT_NEXT_TURN_MESSAGE = {
    0: 'J\'y vais! Bonne chance!',
    1: 'C\'est à moi.',
    2: 'Essaye de deviner rapidement...'
}

export const BOT_TIMEOUT_MESSAGE = {
    0: 'Ce n\'est pas grave! Tu l\'aura la prochaine fois!',
    1: 'Mais voyons! Tu étais si proche...',
    2: 'VRAIMENT!?!'
}

export const BOT_SECOND_TIMEOUT_MESSAGE = {
    0: 'Au moins tout le monde a fait de son mieux!',
    1: 'Ouf, on a eu de la chance...',
    2: 'Je suis entouré par des incompétents!'
}

export const BOT_VICTORY_MESSAGE = {
    0: 'Bien joué tout le monde! Ce n\'était pas une victore facile',
    1: 'Super, on a gagner!',
    2: 'La prochaine fois, donnez nous un défi...'
}

export const BOT_DEFEAT_MESSAGE = {
    0: 'Bien joué, on l\'aura la prochaine fois!',
    1: 'Je n\'arrive pas à y croire...',
    2: 'NOOOOON!!!'
}