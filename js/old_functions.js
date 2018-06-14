	//Elimina Riga
	$("table").on('click','.remove-btn', function() {
		
		var r = confirm("Sicuro di Eliminare l'evento?");
		
		if (r == true){
		
			var numero = $(this).parents('tr').find("td:eq(0)").text();
		
			console.log(numero);
		
			var eventToRemove = firebase.database().ref( "events/" + numero);
		
			console.log(eventToRemove.toString());
		
			eventToRemove.remove();
		
		}
		
		alert("Evento Eliminato");
		
	});
	
	$("#getMaxId").on('click',function(){
		
		var eventTo = firebase.database().ref("/");

		eventTo.orderByKey().limitToLast(1).on("value", function (snapshot){
			
			snapshot.forEach(function(data) {
				console.log("The " + data.key + " score is " + data.key);
			});

			
		} );
		
		
	});
	
	//Visualizza Evento
	$("table").on('click','.vis-btn', function() {
		
		$("#modal-title").text("Visualizza Evento");

		$("#modal-ricerca-eventi .close").click();
		
		var numero = $(this).parents('tr').find("td:eq(0)").text();
		
		var numeroSplit = numero.split("_");
		
		var data = $(this).parents('tr').find("td:eq(1)");
		
		var eventToEdit = firebase.database().ref( "events/" + numero);
		
		eventToEdit.once('value').then(function (data) {		
		
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
			
			var dataOraEvento = data.val().dataEvento.split(" ");
			setDefaultDate(dataOraEvento[0],dataOraEvento[1]);
			

			$("#numero-evento").prop( "disabled", true );
			$("#progressivo-evento").prop( "disabled", true );
			$("#curia").prop( "disabled", true );
			$("#giudice").prop( "disabled", true );
			$("#parte").prop( "disabled", true );
			$("#c-parte").prop( "disabled", true );
			$("#adempimento").prop( "disabled", true );
			$("#provvedimento").prop( "disabled", true );
			$("#data-preavviso").prop( "disabled", true );
			$("#atto-preavviso").prop( "disabled", true );
			$("#rg").prop( "disabled", true );
			$("#sospesa").prop( "disabled", true );
			$('#data').prop( "disabled", true );
			$('#ora-evento').prop( "disabled", true );
			$('#provenienza').prop( "disabled", true );


			$("#modal-crea-evento").modal('show');
		
		});
		
	});
