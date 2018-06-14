function printData(filteredValues,len){
    
    alert("dai cazzo");
    
     var row = 0;
     var col = 0;
     var day = "";
     var dayToCompare = "";
     var output = "";
     for (row = 0;row<len;row++){

         var dayToCompare = filteredValues[row][1].split(' ')[0];
        //        for (col = 0; col <10 ; col ++){console.log(filteredValues[row][col]);}

        if (dayToCompare == day){
            output += "<tr>";
            output += "<td>" + filteredValues[row][0] + "</td>";
            output += "<td>" + filteredValues[row][1] + "</td>";
            output += "<td>" + filteredValues[row][2] + " \n " + filteredValues[row][3] + "</td>";
            output += "<td>" + filteredValues[row][4] + " \n " + filteredValues[row][5] + "</td>";
            output += "<td>" + filteredValues[row][6] + "</td>";
            output += "<td>" + filteredValues[row][7] + "</td>";
            output += "<td>" + filteredValues[row][8] + "</td>";
            output += "</tr>";

        }else{
            output += '</table><br class = "page-break"><table><tr>';
            output += "<td>" + filteredValues[row][0] + "</td>";
            output += "<td>" + filteredValues[row][1] + "</td>";
            output += "<td>" + filteredValues[row][2] + " \n " + filteredValues[row][3] + "</td>";
            output += "<td>" + filteredValues[row][4] + " \n " + filteredValues[row][5] + "</td>";
            output += "<td>" + filteredValues[row][6] + "</td>";
            output += "<td>" + filteredValues[row][7] + "</td>";
            output += '<td>' + filteredValues[row][8] + "</td>";
            output += "</tr>";

            day = dayToCompare;
        }
   
     }

    output += '</table>';
    
    $("#print-table-div").load("templateStampa.html").html(output);
    
}