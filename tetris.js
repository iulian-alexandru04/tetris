function draw_rectangle(Y, X, C)
{
    if(C == undefined)
        return;
    ctx.fillStyle = C;
    ctx.fillRect(X*dim, Y*dim, dim, dim);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(X*dim, Y*dim, dim, dim);
}
function draw_piece(piece)
{
    if(piece == undefined)
        return;
    for(block of piece.shape)
        draw_rectangle(block[0]+piece.y_offset, block[1]+piece.x_offset, piece.color);
}
function draw_frame()
{
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    for(let i=0; i<max_y_blocks; i++)
        for(let j=0; j<max_x_blocks; j++)
            draw_rectangle(i, j, block_matrix[i][j]);
    draw_piece(piece);
}
function valid_piece_offset(piece, delta_y, delta_x)
{
    for(block of piece.shape)
    {
        if(!valid_position(block[0]+piece.y_offset+delta_y, 
                            block[1]+piece.x_offset+delta_x))
            return false;
    }
    return true;
}
function key_handler(event)
{
    var left_key = 37;
    var up_arrow_key = 38;
    var right_key = 39;
    if(event.keyCode == right_key)
        if(valid_piece_offset(piece, 0, 1))
            piece.x_offset++;
    
    if(event.keyCode == left_key)
        if(valid_piece_offset(piece, 0, -1))
            piece.x_offset--;

    if(event.keyCode == up_arrow_key)
    {
        new_piece = rotate_piece(piece);
        if(valid_piece_offset(new_piece, 0, 0))
            piece = new_piece;
    }
    draw_frame();
}
function push_down()
{
    if(valid_piece_offset(piece, 1, 0))
        piece.y_offset++;
    else
    {
        keep_in_place(piece);
        generate_block();
    }
    draw_frame();
}
function valid_position(y, x)
{
    if(x < 0 || x >= max_x_blocks)
        return false;

    if(y < 0 || y >= max_y_blocks)
        return false;

    return !overlap(y, x);
}
function overlap(y, x)
{
    return block_matrix[y][x] != undefined;
}
function remove_blocks_from_line_and_shift_others(y)
{
    for(let i=y; i>0; i--)
        block_matrix[i] = block_matrix[i-1];
    block_matrix[0] = new Array(max_x_blocks);
}
function remove_blocks_if_complete_line()
{
    for(let i=max_y_blocks-1; i>=0; i--)
    {
        complete_line = true;
        for(let j=0; j<max_x_blocks && complete_line; j++)
            if(!overlap(i, j))
                complete_line = false;
        if(complete_line)
        { 
            remove_blocks_from_line_and_shift_others(i); 
            score++;
            document.getElementById("score").innerHTML = "SCORE: " + score
        }
    }
}
function keep_in_place(piece)
{
    for(block of piece.shape)
        block_matrix[block[0]+piece.y_offset][block[1]+piece.x_offset] = piece.color;
    remove_blocks_if_complete_line();
}
function gen_shape()
{
    var shapes = [
        [[0, 1], [1, 1], [2, 1], [3, 1]],
        [[1, 1], [1, 2], [2, 1], [2, 2]],
        [[0, 0], [0, 1], [1, 1], [2, 1]],
        [[0, 2], [0, 1], [1, 1], [2, 1]],
        [[0, 1], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 0], [1, 1], [2, 0]],
        [[0, 0], [1, 0], [1, 1], [2, 1]],
        ];
    let index = Math.floor(Math.random()*shapes.length)
    return shapes[index];
}
function rotate_piece(piece)
{
    let result_shape = [];
    for(block of piece.shape)
        result_shape.push(project_block_rotation(block));
    new_piece = JSON.parse(JSON.stringify(piece));
    new_piece.shape = result_shape;
    return new_piece;
}
function project_block_rotation(block)
{
    return [max_y_shape-block[1], block[0]];
}
function generate_block()
{
    crt_shape = gen_shape();
    crt_color = '#'+Math.floor(Math.random()*16777215).toString(16);
    piece = {shape:crt_shape, color:crt_color, y_offset:0, x_offset:3};
    if(!valid_piece_offset(piece, 0, 0))
    {
        piece = undefined;
        document.getElementById("msg").innerHTML = "Game Over!"
        clearInterval(push_down_interval);
    }
    draw_frame();
}
var score = 0;
var dim = 50;
var width = 500;
var height = 750;
var max_y_shape = 2;
var max_y_blocks = height / dim;
var max_x_blocks = width / dim;
var piece = null;
var my_canvas = document.getElementById("myCanvas");
var ctx = my_canvas.getContext("2d");
var block_matrix = [];
for(let i=0; i<max_y_blocks; i++) {
    block_matrix[i] = new Array(max_x_blocks);
}
generate_block();
push_down_interval = setInterval(push_down, 333);
window.addEventListener("keydown", key_handler);
