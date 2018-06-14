var allEventsTable;
var theadToPrint;
var cachedEventsFB;
var eventRefPres;
var masterEventCache;
var progressiviUsatiList;
var colors     = ['#99b1d8', '#82ff9b', '#f4ff82', '#ff9482', '#d8a5ff', 'transparent'];
//var days       = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
//var months     = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
//var parsedDays = [7, 1, 2, 3, 4, 5, 6];

$(document).ready(function(){
    
    
    firebase.auth().onAuthStateChanged(function(user) {
        
        if (user) {
            
            $('input').addClass('form-control');
            $('select').addClass('form-control');
            
            eventRefPres = firebase.database().ref('/events-pres/');
            eventRefPast = firebase.database().ref('/events-past/');
            
            var printEventsTable = $('#print-events-table');
            var detailButtonHTML = '<button class = "edit-btn btn" > Dettagli</button>';
            var eventRefPres = firebase.database().ref('/events-pres/');
            var eventRefPast = firebase.database().ref('/events-past/');
            theadToPrint = '<table class = "print-table table-bordered table-striped table-to-print"><tr><th>Numero</th><th>Provenienza / RG</th><th>Curia / Giudice</th><th>Ora</th><th>Parte / cParte</th><th>Adempimento</th><th>Provvedimento</th></tr>';

            console.log('loading data');
            loadData();

            var idxColor = 0;

            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);

            allEventsTable = $('#all-events-table').DataTable({
                dom: 'Blrtip',
                buttons: [
                        {text : 'Crea', action : function(){newEvent()}},
                        {text : 'Aggiorna', action : function(){loadData()}}
                ]
            });

            $('#all-events-table tfoot th').each( function () {
                var title = $(this).text();
                $(this).html( '<input type="text" placeholder="Cerca '+title+'" />' );
            })

            allEventsTable.columns().every( function () {
                var that = this;

                $( 'input', this.footer() ).on( 'keyup change', function () {
                    if ( that.search() !== this.value ) {
                        that
                            .search( this.value )
                            .draw();
                    }
                } );
            } );

        $("#conferma-stampa").on('click',function(){

            var date = $('#datepicker_from').val();
            printFilteredValues(date);

        });

        $('#crea-evento-btn').on('click',function(){

            newEvent();

        });

        $('#search-criteria-btn').on('click',function(){

            //var searchField 	= $('#select-search-field').val();
            var searchField 	= 'numero';
            var textToSearch	= $('#text-search-input').val();

            console.log('Campo di ricerca: ' + searchField + ' Testo da cercare: ' + textToSearch);

            searchCriteria(searchField,textToSearch);

        });

        $('#print-button').on('click',function(){

            var printFrom 	= $('#print-from-input').val();
            var printTo		= $('#print-to-input').val();

            console.log('Intervallo di stampa: ' + printFrom + '/' + printTo);

            printValues(printFrom,printTo);

        });
            
        $('#scadenze-btn').on('click',function(){
            $("#form-exp").find("input").val('');
            var numero = $("#numero-evento").val();    

            var event = firebase.database().ref('events-pres/' + numero + '/-/');

            event.once('value',function(dataPres){

                if(dataPres.val()==null){

                    console.log('Non ho trovato corrispondenze nel nodo events-pres');
                    event = firebase.database().ref('events-past/' + numero + '/-/');

                    event.once('value',function(dataPast){

                        $("#numero-exp").html(dataPast.val().numero);
                        $("#curia-exp").html(dataPast.val().curia);
                        $("#giudice-exp").html(dataPast.val().giudice);
                        $("#parte-exp").html(dataPast.val().parte);
                        $("#c-parte-exp").html(dataPast.val().cparte);
                        $("#rg-exp").html(dataPast.val().rg);
                        $('#provenienza-exp').html(dataPast.val().provenienza);
                        $('#data-exp').html(dataPast.val().dataEvento);


                    });

                } else {

                    $("#numero-exp").html(dataPres.val().numero);
                    $("#curia-exp").html(dataPres.val().curia);
                    $("#giudice-exp").html(dataPres.val().giudice);
                    $("#parte-exp").html(dataPres.val().parte);
                    $("#c-parte-exp").html(dataPres.val().cparte);
                    $("#rg-exp").html(dataPres.val().rg);
                    $('#provenienza-exp').html(dataPres.val().provenienza);
                    $('#data-exp').html(dataPres.val().dataEvento);

                }
            });            


            $('#scadenze-modal').modal('show');
            console.log($("#numero-evento").val());

        });

        $('#select-scadenze-automatiche').change(function(){ 
            var value = $(this).val();
            console.log(value);
            generateExpDate(value);
        });

        $('#elimina-evento-btn').on('click',function(){

            var r = confirm("Sicuro di Eliminare l'evento?");

            if (r == true){

                var eventToDelete = $('#numero-evento').val() + "/" + $('#progressivo-evento').val();

                console.log('Event to Delete: ' + eventToDelete);

                var eventToDeletePresFB = firebase.database().ref( 'events-pres/' + eventToDelete);
                var eventToDeleteSuspFB = firebase.database().ref( 'events-susp/' + eventToDelete);
                var eventToDeletePastFB = firebase.database().ref( 'events-past/' + eventToDelete);

                console.log('Path to Delete' + eventToDeletePresFB.toString());
                console.log('Path to Delete' + eventToDeleteSuspFB.toString());
                console.log('Path to Delete' + eventToDeletePastFB.toString());

                eventToDeletePresFB.remove();
                eventToDeleteSuspFB.remove();
                eventToDeletePastFB.remove();

                alert("Evento Eliminato");


            }

        });

        /* $('#all-events-table').on('click','td',function(){

             var tr = $(this).closest("td");
             tr.css('background-color',colors[idxColor]);

             idxColor ++;

             if (idxColor > 5) {

                 idxColor = 0;
             }

         });*/

        $('#stampa-sospesi-btn').on('click',function(){

        var divToPrint = document.getElementById('print-suspended-table');
        newWin = window.open("");
        newWin.document.write(divToPrint.outerHTML);
        newWin.print();
        newWin.close();

        });

        $("#copia-evento-btn").on("click",function(){

            $("#provenienza").prop("disabled",true);
            $("#progressivo-evento").prop('disabled',false);

            var provenienzaUpdate = formatDateYYYYmmDD(today);

            $('#provenienza').val(provenienzaUpdate);

        });

        $('#scadebza-btn').on('click',function(){

            generateExpDate();

        });

        $('.focus-out-calc').focusout(function(){

            var preavId   = $(this).attr('id');
            var nRec    = preavId.slice(-1);
            var preavExp = $('#'+preavId).val();

            var selectRef = $('#riferimento' + nRec).val();
            console.log(selectRef);
            var dataRef;
            var dateInputToSet = $('#dateExp' + nRec);



            if (selectRef == 'evento'){ dataRef = $('#data-exp').html() }
            else { dataRef = $('#provenienza-exp').html() }

            console.log(preavId + '/' + preavExp);

            calcolaPreavviso(preavExp,dataRef,dateInputToSet);


        });

        $('#save-exp-btn').on('click',function(){

            for (var x = 0 ; x < 10 ; x++){
                
                if ($('#checkExp' + x).is(':checked')){
                    
                    console.log('###--->>> nRec' + x)
                    
//                  var preavId =   $(this).attr('id');
                    var nRec    =   x;

                    //valori in input per record
                    var progressivo = $('#progressivo' + nRec).val();
                    var adempimento = $('#adempimentoExp' + nRec).val();
                    var provvedimento = $('#provvedimentoExp' + nRec).val();
                    var dataEvento = $('#dateExp' + nRec).val();

                    //valori generali
                    var numero      = $('#numero-exp').html();
                    var parte       = $('#parte-exp').html();
                    var cParte      = $('#c-parte-exp').html();
                    var giudice     = $('#giudice-exp').html();
                    var curia       = $('#curia-exp').html();
                    var rg          = $('#rg-exp').html();
                    var provenienza = $('#provenienza-exp').val();


                    var control = formControl(numero,progressivo,provenienza,dataEvento);

                    if (control > 0){

                        var pathToSet = firebase.database().ref('/events-pres/' + numero + "/" + progressivo);

                        pathToSet.set({
                            'numero'        : numero,
                            'progressivo'   : progressivo,
                            'provenienza'   : provenienza,
                            'dataEvento'    : dataEvento,
                            'oraEvento'     : '09:00',
                            'curia'         : curia,
                            'giudice'       : giudice,
                            'parte'         : parte,
                            'cParte'        : cParte,
                            'adempimento'   : adempimento,
                            'provvedimento' : provvedimento,
                            'rg'            : rg
                        }).then(function(){
                            alert("Inserimento Effettuato");
                            $("#txt"+nRec).val('Salvato');
                        });

                        //loadData();
                    }
                } else {console.log('x non considerata: ' + x);}   
                    
            }

        });

        //Salva Evento
        $("#salva-evento").click(function(){

            var pathToSet = "";
            var numero        = $("#numero-evento").val().toLocaleUpperCase();
            var progressivo   = $("#progressivo-evento").val().toLocaleUpperCase();
            var provenienza   = $("#provenienza").val();
            var dataEvento    = $("#data").val();
            var oraEvento     = $("#ora-evento").val();
            var curia         = $("#curia").val().toLocaleUpperCase();
            var giudice       = $("#giudice").val().toLocaleUpperCase();
            var parte         = $("#parte").val().toLocaleUpperCase();
            var cParte        = $("#c-parte").val().toLocaleUpperCase();
            var adempimento   = $("#adempimento").val().toLocaleUpperCase();
            var provvedimento = $("#provvedimento").val().toLocaleUpperCase();
            var dataPreavviso = $("#data-preavviso").val().toLocaleUpperCase();
            var attoPreavviso = $("#atto-preavviso").val().toLocaleUpperCase();
            var rg            = padding($("#rg").val()).toLocaleUpperCase();
            var sospesa       = '';

            var control = formControl(numero,progressivo,provenienza,dataEvento);

            if (control > 0){ 

                if ($("#sospesa").is(':checked')){

                    console.log('sospesa!');
                    pathToSet = firebase.database().ref('events-susp/' + $('#numero-evento').val() + ' ' + $('#progressivo-evento').val());
                    eventRefPres.child($('#numero-evento').val() + ' ' + $('#progressivo-evento').val()).remove();
                    sospesa = 'VERO';

                }else{

                    pathToSet = firebase.database().ref('/events-pres/' + numero + "/" + progressivo);
                    sospesa = 'FALSO';

                }

                pathToSet.set({
                    'numero'        : numero,
                    'progressivo'   : progressivo,
                    'provenienza'   : provenienza,
                    'dataEvento'    : dataEvento,
                    'oraEvento'     : oraEvento,
                    'curia'         : curia,
                    'giudice'       : giudice,
                    'parte'         : parte,
                    'cParte'        : cParte,
                    'adempimento'   : adempimento,
                    'provvedimento' : provvedimento,
                    'dataPreavviso' : dataPreavviso,
                    'attoPreavviso' : attoPreavviso,
                    'rg'            : rg,
                    'sospesa'       : sospesa
                }).then(function(){
                    
                    alert("Inserimento Effettuato");
                    $('#modal-crea-evento').modal('toggle');
                    
                });

            }

        } );
            
        } else {
        
            $('#login-modal').modal('show');
            
        }
        
        $("table").on('click','.edit-btn', function() {

            console.log('##');
            
            $("#modal-title").text("Modifica Evento");                                  //cambio il titolo del modal                

            $("#copia-evento-btn").show();
            $("#scadenze-btn").show();
            $("#elimina-evento-btn").show();
            $('#related-events').show();

            var numero = $(this).parents('tr').find("td:eq(0)").text();                 //prendo il numero evento e lo splitto per il progressivo
            var numeroSplit = numero.split(" ");

            var relatedEvents = new Array();

            progressiviUsatiList = new Array();

            var output = '';

            var data = $(this).parents('tr').find("td:eq(1)");                          //prendo il valore della data
                                                                                        //imposto la referenza del db per l'evento da visualizzare      
            var eventToEdit = firebase.database().ref('events-pres/' + numeroSplit[0] + "/" + numeroSplit[1]);

            eventToEdit.once("value", function(data) {    

                $("#numero-evento").val(numeroSplit[0]);
                $("#progressivo-evento").val(numeroSplit[1]);
                $("#curia").val(data.val().curia);
                $("#giudice").val(data.val().giudice);
                $("#parte").val(data.val().parte);
                $("#c-parte").val(data.val().cParte);
                $("#adempimento").val(data.val().adempimento);
                $("#provvedimento").val(data.val().provvedimento);
                $("#data-preavviso").val(data.val().dataPreavviso);
                $("#atto-preavviso").val(data.val().attoPreavviso);
                $("#rg").val(data.val().rg);
                $("#sospesa").val(data.val().sospesa);
                $('#data').val(data.val().dataEvento);
                $('#ora-evento').val(data.val().oraEvento);
                $('#provenienza').val(data.val().provenienza);

                var pastEventsRef = firebase.database().ref('events-past/' + numeroSplit[0]);

                pastEventsRef.once('value',function(childs){

                    childs.forEach(function (pastEvent){

                        relatedEvents.push(pastEvent);

                    });

                    var nextEvents = firebase.database().ref('events-pres/' + numeroSplit[0]);

                    nextEvents.once('value',function(childs){

                        childs.forEach(function (nextEvent){

                            relatedEvents.push(nextEvent);	

                        });

                        relatedEvents.sort(sortDate);

                        relatedEvents.forEach(function(data){


                            progressiviUsatiList.push(data.val().progressivo);

                            if (numeroSplit[1] == data.val().progressivo){output += '<tr style = "background-color: #f9bfbf">'}

                            else { output += '<tr>'}

                            output += "<td>" + data.val().numero + ' ' + data.val().progressivo + "</td>";
                            output += "<td>" + data.val().curia + "</td>";
                            output += "<td>" + data.val().giudice + "</td>";
                            output += "<td>" + data.val().adempimento + "</td>";
                            output += "<td>" + data.val().provvedimento + "</td>";
                            output += "<td>" + data.val().dataEvento + "</td>";
                            output += "</tr>";


                        });

                        $('#related-events-table').html(output); 

                        $("#numero-evento").prop( "disabled", true );
                        $("#progressivo-evento").prop( "disabled", true );
                        $("#provenienza").prop("disabled", true);
                        $("#modal-crea-evento").modal('show');


                    });  

                });

            });

        });
        
    });

    
    
    $('#login-button').on('click',function() {
                          
        var password = $('#pass-login-input').val();
        
        firebase.auth().signInWithEmailAndPassword('admin@admin.it', password)
            .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
        });
                          
    });
     
});
 
function setDefaultDate(date,time){
     
    var now = new Date();   
 
    if (date == null){
         
        var month = (now.getMonth() + 1);               
        var day = now.getDate();
         
        if(month < 10) 
            month = "0" + month;
         
        if(day < 10) 
            day = "0" + day;
         
        var defaultDate = now.getFullYear() + '-' + month + '-' + day;
        var defaultTime = "09:00";
         
        $('#data').val(defaultDate);
        $('#provenienza').val(defaultDate);
        $('#ora-evento').val(defaultTime);
     
    }
     
    else {
         
        $('#data').val(date);
        $("#ora-evento").val(time);
     
    }
     
}
     
function printValues(dateFromInput,dateToInput){
    
    var countedValues = 0;
	var endTable = '</table>';
	var pageBreak = '<br class = "page-break">';
	
    cachedEventsFB.sort(sortTime);
    cachedEventsFB.sort(sortDate);
	
	var dateFromInputSplit = dateFromInput.split('-');
	var dateToInputSplit = dateToInput.split('-');
	
	var dateFrom 	= new Date(dateFromInputSplit[0],(dateFromInputSplit[1]-1),dateFromInputSplit[2],0,0,0,0);
	var dateTo 		= new Date(dateToInputSplit[0],(dateToInputSplit[1]-1),dateToInputSplit[2],0,0,0,0);
	
    dateFrom = dateFrom;
    dateTo = dateTo;
    
	var output 		= '';
	var day = new Date();
	
	console.log ('dateFrom: ' + dateFrom + ' / ' + 'dateTo: ' + dateTo);
	
	cachedEventsFB.forEach(function(child){ 
		
            var dayToCompareSplit 	= child.val().dataEvento.split('-');
			var dayToCompare		= new Date(dayToCompareSplit[0],(dayToCompareSplit[1]-1),dayToCompareSplit[2],0,0,0,0);
			var dayFormatted		= dayToCompareSplit[2] + '/' + dayToCompareSplit[1] + '/' + dayToCompareSplit[0];
		
            var diff = dayToCompare - day;
        
			if( dayToCompare > dateFrom && dayToCompare < dateTo ){
			
                countedValues ++;
                
				if(diff == 0){
					
					output += "<tr>";
					output += "<td>" + child.val().numero + " <br> " + child.val().progressivo + "</td>";
                    output += "<td>" + child.val().provenienza + " <br> " + child.val().rg + "</td>";
                	output += "<td>" + child.val().curia + " <br> " + child.val().giudice + "</td>";
                    output += "<td>" + child.val().oraEvento + "</td>";
                	output += "<td>" + child.val().parte + " <br> " + child.val().cParte + "</td>";
                	output += "<td>" + child.val().adempimento + "</td>";
                	output += "<td>" + child.val().provvedimento + "</td>";
                	output += "</tr>";
					
				}else{             
                    
                    if (countedValues !=0 ){
                        
                        output += endTable;
                        output += pageBreak;
                        
                    }
                    

					output += '<h5>' + dayFormatted + '</h5>';
					output += theadToPrint;
					output += '<tr>';
					output += "<td>" + child.val().numero + " <br> " + child.val().progressivo + "</td>";
                    output += "<td>" + child.val().provenienza + " <br> " + child.val().rg + "</td>";
                	output += "<td>" + child.val().curia + " <br> " + child.val().giudice + "</td>";
                    output += "<td>" + child.val().oraEvento + "</td>";
                	output += "<td>" + child.val().parte + " <br> " + child.val().cParte + "</td>";
                	output += "<td>" + child.val().adempimento + "</td>";
                	output += "<td>" + child.val().provvedimento + "</td>";
                	output += "</tr>";
					
					day = new Date(dayToCompare);
					
				}
				
			}
			
		});

	output += '</table>';
    $('#print-table-div').html(output);
    
    alert('Stampa preparata \n Numero di elementi: ' + countedValues + '\n Utilizzare la funzione del browser per un anteprima, oppure "Ctrl + p" per una stampa immediata');

}

    function printSuspended(){

        var outputSusp = '<table class = "table table-bordered table-striped"><tr><th>Numero</th><th>Data</th><th>Curia / Giudice</th><th>Adempimento</th><th>Provvedimento</th><th>R.G.</th></tr>';

        var suspendedEvents = firebase.database().ref('events-susp');
        suspendedEvents.once('value',function(childs){
            
            childs.forEach(function(data){
              
				outputSusp += '<tr>';
				outputSusp += '<td>' + data.key + '</td>';
				outputSusp += '<td>' + data.val().dataEvento + '</td>';
				outputSusp += '<td>' + data.val().curia + ' ' + data.val().giudice +'</td>';
				outputSusp += '<td>' + data.val().adempimento + '</td>';
				outputSusp += '<td>' + data.val().provvedimento +'</td>';
				outputSusp += '<td>' + data.val().rg + '</td>';
				outputSusp += '</tr>';                

            });
            
            outputSusp += '</table>'
            
            $('#print-suspended-table').html(outputSusp);
            
            $('#sospesi-modal').modal('show');
            
        });

    }

function newEvent(){

	$('#past-events').html('');
	$('#next-events').html('');
	$('#related-events').hide();

	$("#provenienza").prop("disabled",false);
	$("#modal-title").text("Crea Evento");
	
    $("#copia-evento-btn").hide();
    $("#scadenze-btn").hide();
	$("#elimina-evento-btn").hide();

	$("#modal-crea-evento").find("input").val('').end();
	$("#modal-crea-evento").find("input").prop('disabled',false).end();

	var eventTo = firebase.database().ref("events-pres");

	cachedEventsFB.sort(sortId);

	var maxID = parseInt(cachedEventsFB[0].val().numero);

	var nextID = maxID + 1;

	$("#numero-evento").val(nextID);
	$("#progressivo-evento").val("-");
	console.log("maxID: " + maxID);

	setDefaultDate(null,null,null);

	$('#modal-crea-evento').modal('show');

}

function formControl(numero,progressivo,provenienza,dataEvento){
 
	console.log(progressiviUsatiList);
	var result = 1;
	
    if(numero== ""){
        alert("Inserire un numero Evento");
        result = -1;
    }

    if (progressivo == ""){
		
        alert("Inserire un numero progressivo");
        result = -1
    }

    if (dataEvento < provenienza ){
        alert("Data evento precedente alla Provenienza");
        result =  -1;

    }
	
    
    if(progressivo != '-'){
    
        if(progressiviUsatiList.includes(progressivo)){

            var r = confirm('Modificare l\'evento con progressivo ' + progressivo + ' ?');

            if (r == true){

                result = 1;
            
            }else{

                result = -1;

            }
        }
    }

    return result;
 
}
 
function loadData(){
    
	cachedEventsFB = new Array();
	var detailButtonHTML = '<button class = "edit-btn btn" > Dettagli</button>';
	var oneYearAgo = new Date();
	oneYearAgo.setHours(0);
	oneYearAgo.setMinutes(0);	
	oneYearAgo.setSeconds(0);
	oneYearAgo.setMilliseconds(0);
	oneYearAgo = oneYearAgo - 31104000000;
	var eventRefPres = firebase.database().ref('/events-pres/');
	var eventsToMove = new Array();
	eventRefPres.once('value' , function (dataSnap){
		$.LoadingOverlay("show");
		allEventsTable.clear();
		dataSnap.forEach(function(childSnap){

			childSnap.forEach(function(child){

				cachedEventsFB.push(child);

				var output      = "";
				var splittedArray = child.val().dataEvento.split("-");  
				var formatteDate    = new Date(splittedArray[0],splittedArray[1] - 1,splittedArray[2]);
				var splitHour       = child.val().oraEvento.split(":");        

				if (formatteDate < oneYearAgo){
					eventsToMove.push(child);

				} else {

					allEventsTable.row.add([

						 child.val().numero + " " + child.val().progressivo,
						 child.val().dataEvento + " " + child.val().oraEvento,
						 child.val().curia,
						 child.val().giudice,
						 child.val().parte,
						 child.val().cParte,
						 child.val().adempimento,
						 child.val().provvedimento,
						 child.val().rg,
						 detailButtonHTML

					]).draw(false);

				}
			});

		});

		$.LoadingOverlay("hide");

		if (eventsToMove.length > 0){
			moveToPast(eventsToMove,eventRefPres);
		}

	});
            
}

function moveToPast(eventsToMove,eventRefPres){
    
    eventsToMove.forEach(function(child){
        
        var pathToMove = firebase.database().ref('events-past/' + child.val().numero + ' ' + child.val().progressivo);
        console.log(child.val());
        pathToMove.set(child.val());
        eventRefPres.child(child.val().numero + '/' + child.val().progressivo).remove();    
        
    });
        
}

function formatDateYYYYmmDD(dateToFormat){
        
        var year    = dateToFormat.getFullYear();
        var month   = dateToFormat.getMonth() + 1;
        var date    = dateToFormat.getDate();
        
        if (month < 10 )    { month = '0' + month}
        if (date < 10)      { date  = '0' + date}
        
        var result = year + '-' + month + '-' + date;
        
        return result;
        
    }

function padding (str) {
    console.log(str);
    console.log(str.length);
    var padded;
    var n0 = '';
        str = str.toString();
        
        if(str.length < 7 ){
            
            var loop = 7 - str.length;
            
            for (var i = 0 ; i< loop ; i ++){
                
                n0 += '0';
            }

            padded = n0 + str;
            
            return padded
            console.log('padded: ' + padded);
        } else {
            
            return str;
            
        }

}


function searchCriteria(searchField,textToSearch){
    
    var detailButton = '<button class = "edit-btn btn" > Dettagli</button>';
    
    var eventRefPres 	= firebase.database().ref('/events-pres/');
	var eventRefPast 	= firebase.database().ref('/events-past/');
	var outputArray		= new Array();
	
	var outputSearch = '<table class = "table table-bordered table-striped"><tr><th>Numero</th><th>Data</th><th>Curia / Giudice</th><th>Adempimento</th><th>Provvedimento</th><th>R.G.</th><th>Azioni</th></tr>';

	
	
	var presResult = eventRefPres.child(textToSearch);
	
	presResult.once('value',function (childs){
		
			childs.forEach(function(data){ outputArray.push(data); });
		
		var pastResult = eventRefPast.child(textToSearch);
	
		pastResult.once('value',function( childs ){
		
  			childs.forEach(function(data) { outputArray.push(data); });
		
		outputArray.sort(sortDate);
		outputArray.forEach(function(data){
		
		
			var dataIT = data.val().dataEvento.split('-');
			
			outputSearch += '<tr>';
			outputSearch += '<td>' + data.key + '</td>';
			outputSearch += '<td>' + dataIT[2] + '/' + dataIT[1] + '/' + dataIT[0] + '</td>';
			outputSearch += '<td>' + data.val().curia + ' ' + data.val().giudice +'</td>';
			outputSearch += '<td>' + data.val().adempimento + '</td>';
			outputSearch += '<td>' + data.val().provvedimento +'</td>';
			outputSearch += '<td>' + data.val().rg + '</td>';
			outputSearch += '<td>' + detailButton + '</td>';
            outputSearch += '</tr>';

       });
			
		$('#search-criteria-table').html(outputSearch);
		$('#search-criteria-modal').modal('show');	
		
	});

		
	});
	       			
    
}

function sortDate(a,b) {
  if (a.val().dataEvento < b.val().dataEvento)
    return -1;
  if (a.val().dataEvento > b.val().dataEvento)
    return 1;
  return 0;
}

function sortTime(a,b) {
  if (a.val().oraEvento < b.val().oraEvento)
    return -1;
  if (a.val().oraEvento > b.val().oraEvento)
    return 1;
  return 0;
}

function sortId(a,b) {
	
	var numeroA = parseInt(a.val().numero);
	var numeroB = parseInt(b.val().numero);
	
  if (numeroA > numeroB)
    return -1;
  if (numeroA < numeroB)
    return 1;
  return 0;
}

function generateExpDate(value){
	
	var expFormRef	= $('#scadenze-form');
	var caseValue 	= value.toString()
	var outputForm 	= '';
    var data    = $('#data-exp').html();
    var prov    = $('#provenienza-exp').html();
    
    
	switch (caseValue){
			
		case 'libero':
			
			console.log('Libero');
            $("#form-exp").find("input").val('');
			break;
			
		
		case 'costituzione':
			
            console.log('Costituzione');
            
            //20 gg prima della data
            $('#progressivo1').val('A01');
            $('#preavvisoExp1').val('-20');
            $('#riferimento1').val('evento');

            var dataRef = $('#dateExp1');
            calcolaPreavviso('-20',data,dataRef);
            
            
            //45 gg prima della data
            $('#progressivo2').val('A02');
            $('#preavvisoExp2').val('-45');
            $('#riferimento2').val('evento');

            var dataRef = $('#dateExp2');
            calcolaPreavviso('-45',data,dataRef);
            
            //20 gg dopo inserimento
            $('#progressivo3').val('A03');
            $('#preavvisoExp3').val('+20');
            $('#riferimento3').val('proven');

            var dataRef = $('#dateExp3');
            calcolaPreavviso('+20',prov,dataRef);
            
			break;
	}
	
	


}

function calcolaPreavviso(nGiorni,dataEvento,dataRef){
            
    var operator = nGiorni.substring(0,1);
    var amount = nGiorni.substring(1);
    
    console.log('Giorni di Preavviso: ' + operator + ' ' + amount);
    var splitDate       = dataEvento.split('-');
    console.log('splitdate: ' + splitDate);
    var date            = new Date(splitDate[0],splitDate[1] - 1,splitDate[2],0,0,0,0);
    var dataPreavviso;
    
    console.log('date: ' + date);
    
    if(operator == '+'){
        console.log(operator);
        dataPreavviso   = new Date(date.valueOf() + (1000*3600*24 * amount));        
    }
    else{
        console.log(operator);
        dataPreavviso   = new Date(date.valueOf() - (1000*3600*24 * amount));
    }
    
    if (dataPreavviso.getDay() == 6){

        console.log("E' Sabato");
        dataPreavviso.setDate(dataPreavviso.getDate() - 1);
        alert('La data del preavviso è calcolata a Sabato, la anticipo al Venerdì');

    }else if(dataPreavviso.getDay() == 0){

        console.log('E Domenica');
        dataPreavviso.setDate(dataPreavviso.getDate() + 1);
        alert('La data del preavviso è calcolata a Domenica, la posticipo al Lunedì');

    }

    console.log(dataPreavviso);
    
    var dataPreavvisoDef = formatDateYYYYmmDD(dataPreavviso);    
    dataRef.val(dataPreavvisoDef);
    console.log(dataPreavvisoDef);

}
