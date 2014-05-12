//TEST DATA
//8ED77B92F29998EDA7A3ABCE6F579DD2 					input
//000000000000000000000000000000000000000000000000 	key
//e9c3c3b2effae80524c237103e350e13 					cipher

var input;					// EN: THE INPUT. LT: IVESTIS
var key;					// EN: THE KEY. LT: RAKTAS
var result;					// EN: THE RESULT. LT: REZULTATAS
var encrypt = true;			// EN: whether the algorithm should encrypt. LT: ar algoritmas turi sifruoti/desifruoti

var binary_input = []; 		// EN: the plaintext in binary format. LT: failas bitu formatu
var binary_key = []; 		// EN: the key in binary format. LT: raktas bitu formatu
var prekeys = new Object();	// EN: the object that holds the 132 prekeys which form the 33 round keys. LT: laiko 132 priesrakcius is kuriu sudaromi 33 ciklu raktai
var round_keys = [];		// EN: key strings which are xored with the data block. LT: ciklu raktai su kuriais xorinama zinute
var message_body = [];		// EN: hold the data to be encrypted/decrypted. LT: zukoduota/neuzkoduota zinute


function main(){
	//PREPARATION~~~~~~~~~~~~~~~~~~~~~~~
	cleanup();

	hex_to_binary( input, binary_input );
	hex_to_binary( key, binary_key );

	to_little_endian();

	pad_key();
	generate_round_keys();


	//CYCLES RUNNER~~~~~~~~~~~~~~~~~~~~~
	initial_permutation();
	perform_rounds();
	final_permutation();


	//PRINT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	show_results();
}





//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~FUNCTIONS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ROUND FUNCTIONS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//EN:
//XOR's the message and a key for the corresponding round
//LT:
//Su'xor'ina rakta ir zinute tam tikrame etape

//Input: INTEGER current cycle number
//Result: xored MESSAGE_BODY
function xor_key_message( step ){
	for( num in message_body ){
		message_body[ num ] = message_body[ num ] ^ round_keys[ step ][ num ];
	}
}


//EN:
//Swaps the bit patterns in our message with the ones specified in a specific SBOX
//LT:
//Pakeicia bitu sekas musu zinuteje kitomis, priklausant nuo dabartinio zingsnio

//Input: INTEGER current cycle number
//Result: transformed MESSAGE_BODY
function sbox_message( step ){
	var message_buff = [];
	var s_box = step % 8;
	var bit_key = "";

	for( var k = 0; k < 32; k++){
		bit_key = "";
		for( var j = 0; j < 4; j++ ){
			bit_key += message_body[ 4*k + j ];
		}
		bit_key = SBox[ s_box ][ bit_key ];
		for( var j = 0; j < 4; j++ ){
			message_buff[ 4*k + j ] = parseInt(bit_key[ j ]);
		}
	}

	message_body = message_buff;
}

function sbox_message_decrypt( step ){
	var message_buff = [];
	var s_box = step % 8;
	var bit_key = "";

	for( var k = 0; k < 32; k++){
		bit_key = "";
		for( var j = 0; j < 4; j++ ){
			bit_key += message_body[ 4*k + j ];
		}
		bit_key = SBoxInverse[ s_box ][ bit_key ];
		for( var j = 0; j < 4; j++ ){
			message_buff[ 4*k + j ] = parseInt(bit_key[ j ]);
		}
	}

	message_body = message_buff;
}


//EN:
//Performs magic xoring of the message with itself
//LT:
//Su'xor'ina zinute su savimi

//Input: MESSAGE_BODY
//Result: transformed MESSAGE_BODY
function linear_transform(){
	var message_buff = [];
	for( var i = 0; i < 128; i++){
		message_buff[ i ] = linear_transform_xor( linear_transformations[ i ] );
	}
	message_body = message_buff;
}

function linear_transform_decrypt(){
	var message_buff = [];
	for( var i = 0; i < 128; i++){
		message_buff[ i ] = linear_transform_xor( linear_transformations_decrypt[ i ] );
	}
	message_body = message_buff;
}


//EN:
//A helper function to linear_transform, xors the specified bits
//LT:
//Pagalbine funkcija linear_transform, su'xor'ina norimus bitus

//Input: INTEGER ARRAY of bit positions
//Result: xored bits of MESSAGE_BODY
function linear_transform_xor( linear_transformation ){
	var buff = 0;
	for( num in linear_transformation ){
		buff = buff ^ message_body[ linear_transformation[ num ] ];
	}

	return buff;
}


//EN:
//Shuffles our message using the default tables
//LT:
//Sumaiso bitus musu zinuteje pagal IP ir FP taisykles

//Input: MESSAGE_BODY
//Result: shuffled bits of MESSAGE_BODY
function initial_permutation(){
	for( position in IP ){
		message_body[ position ] = binary_input[ IP[ position ] ];
	}
}

function final_permutation(){
	var end_message = [];
	for( position in FP ){
		end_message.push( message_body[ FP[ position ] ] );
	}

	message_body = end_message;
}


//EN:
//Performs the round operations for encryption/decryption: xor key with message, pattern changing with sboxes and linear transformation( selfxoring )
//LT:
//Suka algoritmo ciklus sifravimui/desifravimui: xor'inimas rakto su zinute, bitu sekos keitimas ir linejines transformacijos( save'xor'inimas )

//Input: MESSAGE_BODY, ROUND_KEYS
//Result: allmost encrypted/decrypted MESSAGE_BODY
function perform_rounds(){
	if( encrypt ){
		for( var i = 0; i < 32; i++){
			xor_key_message(i);
			sbox_message(i);

			if( i != 31 )
				linear_transform();
		}

		xor_key_message(32);

	} else {
		xor_key_message(32);

		for( var i = 31; i > -1; i--){
			if( i != 31 )
				linear_transform_decrypt();

			sbox_message_decrypt(i);
			xor_key_message(i);
		}
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~PREPARATION~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//EN:
//Cleans up
//LT:
//Apsisvarina
function cleanup(){
	binary_input = []; 		
	binary_key = []; 		
	prekeys = new Object();
	round_keys = [];
	message_body = [];
}


//EN:
//Transforms given hex string into a binary string
//LT:
//Transformuoja sesioliktainio formato duomenis i bitstringa

//Input: HEXSTRING text
//Result: BITSTRING text
function hex_to_binary( source, destination ){
	var char_code = source.split("");
	char_code.forEach( function(e){ 
		var code = parseInt( e, 16 ).toString(2).split("").map( Number );
		while( code.length < 4 ){
			code = [ 0 ].concat( code );
		}
		for( el in code )	
			destination.push( code[ el ] );
	});
}


//EN:
//Changes the key and message into little endian format( the least significant bit is the first bit )
//LT:
//Keicia rakta ir zinute i little endian formata( maziausiai reiksmingas bitas yra pirmas bitas )

//Input: BINARY_INPUT, BINARY_KEY
//Result: reversed BINARY_INPUT, reversed BINARY_KEY
function to_little_endian(){
	binary_input.reverse();
	binary_key.reverse();
}


//EN:
//If key is less then 256 than pads it 
//LT:
//Jei raktas trumpesnis nei 256 bitai tai pailgina ji

//Input: BINARY_KEY
//Result: 256bit BINARY_KEY
function pad_key(){
	binary_key.push( 1 );
	while( binary_key.length < 256 ) {
		binary_key.push( 0 );
	}
}


//EN:
//Generates the round keys needed for xoring
//LT:
//Sugeneruoja is musu pateikto rakta 33 ciklu raktus

//Input: BINARY_KEY
//Result: 33 ROUND_KEYS
function generate_round_keys(){
	//Split key into 8 blocks of 32
	for( var i = 0; i < 8; i++ ){
		prekeys[ i-8 ] = binary_key.slice( i * 32, i * 32 + 32 );
	}

	//Expand the prekeys array
	for( var i = 0; i < 132; i++){
		prekeys[ i ] = xor_prekeys( i );
	}

	//Shuffle the bits with an Sbox and combine into a round key
	combine_prekeys_to_roundkeys();

	//Key permutation
	shuffle_roundkey_bits();
}


//EN:
//Helper function, expands our 8 prekeys to 132 prekeys with xoring and shifting
//LT:
//Pagalbine funkcija, praplecia musu 8 priesrakcius i 132 ciklu raktus

//Input: INTEGER prekey number
//Output: 1 generated PREKEY
function xor_prekeys( index ) {
	var super_golden_slice = parseInt("0x9e3779b9").toString(2).split("").map( Number ).reverse();
	var hobo = JSON.parse(JSON.stringify(prekeys[ index-8 ]));

	for( var i = 0; i < 32; i++){
		hobo[ i ] = hobo[ i ] ^ prekeys[ index-5 ][ i ];
		hobo[ i ] = hobo[ i ] ^ prekeys[ index-3 ][ i ];
		hobo[ i ] = hobo[ i ] ^ prekeys[ index-1 ][ i ];
		hobo[ i ] = hobo[ i ] ^ super_golden_slice[ i ];
	}

	index = index.toString(2).split("").map( Number ).reverse();
	while( index.length < 32 ){
		index.push( 0 );
	}

	for( num in index ){
		hobo[ num ] = hobo[ num ] ^ index[ num ];
	}

	var hobo2 = [];
	for( var i = 0; i < 32; i++ ){
		hobo2[ i ] = hobo[ (i + 21)%32 ];
	}

	return hobo2;
}


//EN:
//Helper function, orders prekeys into round keys
//LT:
//Pagalbine funkcija, organizuoja priesrakcius i ciklu raktus

//Input: 132 PREKEYS
//Result: 33 ROUND_KEYS
function combine_prekeys_to_roundkeys(){
	var s_box = 3;
	var bit_key = "";
	for( var i = 0; i < 33; i++ ){
		round_keys.push([]);
		round_keys[ i ] = [];

		for( var k = 0; k < 32; k++){
			bit_key = "";
			for( var j = 0; j < 4; j++ ){
				bit_key += prekeys[ 4*i + j ][ k ];
			}
			bit_key = SBox[ s_box ][ bit_key ];
			round_keys[ i ][ 0  + k ] = parseInt(bit_key[ 0 ]);
			round_keys[ i ][ 32 + k ] = parseInt(bit_key[ 1 ]);
			round_keys[ i ][ 64 + k ] = parseInt(bit_key[ 2 ]);
			round_keys[ i ][ 96 + k ] = parseInt(bit_key[ 3 ]);
		}

		s_box == 0? s_box = 7: s_box--;
	}
}


//EN:
//Helper function, for every round key, performs a permutation on its bits
//LT:
//Kiekvienam ciklo raktui permaiso bitus sekas

//Input: 33 ROUND_KEYS
//Result: 33 ROUND_KEYS with shuffled bits
function shuffle_roundkey_bits(){
	var round_buff = [];
	for( var i = 0; i < 33; i++ ){
		for( position in IP ){
			round_buff[ position ] = round_keys[i][ IP[ position ] ];
		}
		round_keys[ i ] = round_buff.slice();
	}
}


//EN:
//Prints 128bit arrays in HEX big endian format
//LT:
//Ispausdina 128 bitu masyvus HEX big endiand formatu

//Input: 128bit ARRAY
//Output: BIG ENDIAND STRING
//Result: console message
function print( what ){
	cipher = "";
	what.reverse();
	for( var i = 0; i < 128; i += 4 ){
		cipher += parseInt( what.slice( i, i+4 ).join(""), 2 ).toString(16);
	}
	what.reverse();
	console.log( cipher.toUpperCase() );
	return cipher.toUpperCase()
}


//EN:
//Displays the end message result in an HTML element
//LT:
//Atvaizduoja uzkoduota/atkoduota pranesimas HTML elemente

//Input: MESSAGE_BODY
//Result: visual feedback
function show_results(){
	result = print( message_body );
	document.querySelector(".data-result").innerHTML = result;
}