//EN:
//Initializes event listeners and handlers for button pushes
//LT:
//Inicializuoja mygtuku stebejima
function init_ui(){
	document.querySelector( ".button-start-algorithm" ).addEventListener( "click", function(){ run_setup(); });
	document.querySelector( ".button-set-mode" ).addEventListener( "click", function(){ change_mode(); });
	document.querySelector( ".button-swap-input-result" ).addEventListener( "click", function(){ swap_input_result(); change_mode(); });

	file_management();

	prettify();
}


//EN:
//Reads the user input, runs the algorithm and generates a download link
//LT:
//Pasiziuri vartotojo ivesti, prasuka algoritma ir sugeneruoja nuoroda i faila
function run_setup(){
	input = document.querySelector( ".data-input").value;
	key = document.querySelector( ".data-key").value;

	main();
	generate_download();
}


//EN:
//Handles the file upload
//LT:
//Rupinasi failu valdymu
function file_management(){
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	} else {
	  alert('The File APIs are not fully supported in this browser.');
	}


	document.querySelector( ".file-input" ).addEventListener( 'change', function( event ){
		var file = event.target.files[ 0 ];
		var reader = new FileReader();
		reader.onload = function(){
			document.querySelector( ".data-input" ).value = reader.result;
			set_bit_count( ".data-input-area .info-bit-number", document.querySelector( ".data-input" ).value.length);
		}

		reader.readAsText( file );
	});

	document.querySelector( ".file-key" ).addEventListener( 'change', function( event ){
		var file = event.target.files[ 0 ];
		var reader = new FileReader();
		reader.onload = function(){
			document.querySelector( ".data-key" ).value = reader.result;
			set_bit_count( ".data-key-area .info-bit-number", document.querySelector( ".data-key" ).value.length);
		}

		reader.readAsText( file );
	});
}


//EN:
//Creates a url for result download
//LT:
//Generuoja nuoroda rezultatui parsisiusti
function generate_download(){
   document.querySelector( ".button-download" ).setAttribute( "href", 'data:Application/octet-stream,' + encodeURIComponent( result ) );
}


//EN:
//Changes between encryption/decryption modes
//LT:
//Keicia sifravimo/desifravimo rezima
function change_mode(){
	encrypt = !encrypt;
	document.querySelector( ".button-set-mode" ).innerHTML = encrypt? "Mode: Encryption":"Mode: Decryption";
}


//EN:
//Sets previous result as input( for decryption checking )
//LT:
//Nustato rezultata kaip ivesti( desifravimo testavimui )
function swap_input_result(){
	input = result;
	document.querySelector( ".data-input" ).value = input;
	set_bit_count( ".data-input-area .info-bit-number", document.querySelector( ".data-input" ).value.length);
}





//VISUAL HELPERS, NO COMMENTS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function prettify(){
	document.querySelector( ".button-swap-input-result" ).style.setProperty( "width",  window.getComputedStyle(document.querySelector( ".button-swap-input-result"), null ).getPropertyValue( "height" ) );
	document.querySelector( ".data-input" ).addEventListener( "change", function(event){
		set_bit_count( ".data-input-area .info-bit-number", this.value.length);
	});
	document.querySelector( ".data-input" ).addEventListener( "input", function(event){
		set_bit_count( ".data-input-area .info-bit-number", this.value.length);
	});
	document.querySelector( ".data-key" ).addEventListener( "change", function(event){
		set_bit_count( ".data-key-area .info-bit-number", this.value.length);
	});
	document.querySelector( ".data-key" ).addEventListener( "input", function(event){
		set_bit_count( ".data-key-area .info-bit-number", this.value.length);
	});
}


function set_bit_count( where, bit_count ){
	document.querySelector( where ).innerHTML = bit_count*4 + " bit";
	document.querySelector( where ).style.setProperty( "color", where.indexOf("key")? bit_count*4 <= 256? "#95a5a6": "#c0392b" : bit_count*4 <= 128? "#95a5a6": "#c0392b" );
}