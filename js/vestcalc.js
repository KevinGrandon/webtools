!function() {

	var calculateOptions = function() {
		var grants = []
			, grantedSum = 0
			, i
			, grantDates = []

		// Populate the grants
		n.all('.vesting-forms div.form-inline').each(function(el){
			var grantDateObj = Date.parse(el.one('.grantdate').get('value'))
				, cliffDateObj = Date.parse(el.one('.cliffdate').get('value'));

			grants.push({
				count: el.one('.shares').get('value')
				, price:parseFloat(el.one('.price').get('value'))
				, grantDate: grantDateObj
				, cliffDate: cliffDateObj
				, cliffCount: parseInt(el.one('.cliffshares').get('value'), 10)
				, remainingMonths: parseInt(el.one('.addtlmonths').get('value'), 10)
			});
		});

		//find the earliest cliff
		for(i=0; i<grants.length; i+=1) {
			var remainingOptions = grants[i].count
				, remainingMonths = grants[i].remainingMonths
	
			if(grants[i].cliffCount > 0) {
				var dateSnapshot = new Date()
				dateSnapshot.setTime(grants[i].cliffDate)
				grantDates.push({date:dateSnapshot, count:grants[i].cliffCount, priceEach:grants[i].price, totalPrice:grants[i].price*grants[i].cliffCount})
				remainingOptions -= grants[i].cliffCount;
			}
	
			var perMonth = Math.floor(remainingOptions/remainingMonths)
				, currentDate = new Date()
			currentDate.setTime(grants[i].cliffDate.valueOf())
			while(remainingMonths > 0) {
				currentDate.setMonth(currentDate.getMonth()+1)
				var count = remainingMonths == 1 ? remainingOptions : perMonth
					, dateSnapshot = new Date()
				dateSnapshot.setTime(currentDate.valueOf())
				grantDates.push({date:dateSnapshot, count:count, priceEach:grants[i].price, totalPrice:grants[i].price*count})
				remainingMonths -= 1;
				remainingOptions -= count
			}
		}
		grantDates.sort(function(a,b){
			return a.date/1 - b.date/1
		});
	
		var dates = n.one("#dates")
			, optionTotal = 0
			, priceTotal = 0
			, months = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"]
			, tableContent = '<table class="table table-bordered table-striped table-condensed">' + 
				'<thead><tr>' +
					'<th>date</th><th># of options</th><th>options to date</th><th>price each</th><th>price of new options</th><th>price to date</th>' +
				'</tr></thead><tbody>';

		dates.setContent("");

		for(i=0; i<grantDates.length; i+=1) {
			optionTotal += grantDates[i].count
			priceTotal += grantDates[i].totalPrice

			tableContent += "<tr>" +
				"<td>" + 
					months[grantDates[i].date.getMonth()] + " " + grantDates[i].date.getDate() + ", " + 
					grantDates[i].date.getFullYear() + 
				"</td>" +
				"<td>" + grantDates[i].count + "</td>" + 
				"<td>" + optionTotal + "</td>" + 
				"<td>" + currency(grantDates[i].priceEach) + "</td>" + 
				"<td>" + currency(grantDates[i].totalPrice) + "</td>" + 
				"<td>" + currency(Math.floor(priceTotal*100)/100) + "</td>" +
			"</tr>";
		}
		tableContent += '</tbody></table>';

		dates.setContent(tableContent);
	}

	function addRow() {
		var newNode = n.node.create('<div class="form-inline"></div>');
		newNode.setContent(n.one('.vesting-forms div.form-template').getContent())
		n.one('.vesting-forms .vesting-rows').append(newNode);
	}

	n.one('.add-vesting-row').on('click', function(e) {
		addRow();
		e.stop();
	});

	n.one('.vesting-calculate').on('click', function(e) {
		e.stop();
		calculateOptions();
	});

	n.one('.vesting-forms').on('click', function(e) {
		if (e.target.hasClass('btn-danger')) {
			e.stop();
			e.target.ancestor('div.form-inline').remove();
		}
	});

	addRow();
}();