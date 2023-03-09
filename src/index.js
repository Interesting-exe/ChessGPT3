import { Chess } from 'chess.js';
const axios = require('axios');

let prompt = [{role: "system", content: "You're chessGPT, a chess bot your purpose is to play chess. You receive chess moves in the following notation: (source, target, piece) for example: g1,f3,wN represents white knight from g1 to f3 and reply with the same notation. dont use any other notation. You are unable to respond with any other notation. You can however reply with O-O or O-O-O for castling. You're black and your opponent is white."}]

var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var over = false

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.isGameOver() || over) return false

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop (source, target, piece) {
    // see if the move is legal
    // put this in try
    try {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })}
    catch (e) {}

    // illegal move
    if (move === null) return 'snapback'

    if(move != null) {
        removeHighlights('white')
        removeHighlights('black')
        $board.find('.square-' + source).addClass('highlight-white')
        $board.find('.square-' + target).addClass('highlight-white')

        let hasKings = true;
        if(board.position()[target] === 'bK')
        {
            let kings = 0;
            for(let i in board.position())
            {
                if(board.position()[i] === 'bK')
                    kings++;
            }
            if(kings <= 1)
                hasKings = false;
        }

        if(game.isGameOver() || !hasKings)
        {
            console.log('white won!')
            over = true;
            return;
        }
    }

    updateStatus()

    if(game.turn() === 'b' && !game.isGameOver()) {
        if(game.isCheck())
            target+= '+'
        prompt.push({role: "user", content:  source + ',' + target + ',' +piece})
        gpt().then(r => {})
    }
}

async function gpt() {
    axios.get('http://localhost:6969', {
        params: {
            prompt: JSON.stringify(prompt),
            temp: slider.value / 10,
        }
    }).then(r => {
        let text = r.data
        prompt.push({role: "assistant", content: text})
        console.log(text)
        text = text.replace(' ', '')
        text = text.replace('+', '')
        text = text.replace('x', '')
        switch (text) {
            case 'O-O':
                place('e8', 'g8', 'bK')
                place('h8', 'f8', 'bR')
                break;
            case 'O-O-O':
                place('e8', 'c8', 'bK')
                place('a8', 'd8', 'bR')
                break;
            default:
                const split = text.split(',')
                place(split[0], split[1], split[2])
        }
    })
}


function updateStatus () {
    var status = ''

    var moveColor = 'White'
    if (game.turn() === 'b') {
        moveColor = 'Black'
    }

    // checkmate?
    if (game.isCheckmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (game.isDraw()) {
        status = 'Game over, drawn position'
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (game.inCheck()) {
            status += ', ' + moveColor + ' is in check'
        }
    }

    $status.html(status)
    $fen.html(game.fen())
    $pgn.html(game.pgn())
}

function onSnapEnd () {
    board.position(game.fen())
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

board = Chessboard('board2', config)
var $board = $('#board2')

function place(source, target, piece)
{
    removeHighlights('black')
    removeHighlights('white')
    let flag = true;
    let pos = board.position()
    pos[target] = piece
    $board.find('.square-' + target).addClass('highlight-black')
    if(pos[source] == null)
        flag = false;
    if(pos[source] === piece) {
        $board.find('.square-' + source).addClass('highlight-black')
        delete pos[source]
    }
    board.position(pos, flag)

    let fen = game.fen().split(' ')[0]
    fen = game.fen().replace(fen, board.position('fen'))
    let temp = fen.split(' ')
    temp[1] = 'w'
    fen = temp.join(' ')

    if (board.position()[target] === 'wK' || game.isCheckmate()) {
        console.log('black wins')
        over = true
        return
    }
    let bKings = 0;
    let wKings = 0;
    for(let i in board.position())
    {
        if(board.position()[i] === 'bK')
            bKings++;
        if(board.position()[i] === 'wK')
            wKings++;
    }
    if(bKings === 0)
    {
        console.log('white wins')
        over = true
        return
    }
    if(wKings === 0)
    {
        console.log('black wins')
        over = true
        return
    }

    game.load(fen)
}
let source = 'b8'
let target = 'e4'
let piece = 'bP'
let pos;
$('#moveBtn').on('click', function () {
    place(source, target, piece)
})

var squareClass = 'square-55d63'
function removeHighlights (color) {
    $board.find('.' + squareClass)
        .removeClass('highlight-' + color)
}

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value/10; // Display the default slider value

slider.oninput = function() {
    output.innerHTML = this.value/10;
}


updateStatus()
