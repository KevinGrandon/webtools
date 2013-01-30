!function() {

	var numRows = 0
	n.all('div.calcaverage textarea').each(function(textarea) {
		textarea.on('keyup', function(e) {
			var lines = e.target.get('value').split("\n")
			var total = 0
			var count = 0

			lines.forEach(function(val) {
				if (/^[0-9]+$/.test(val)) {
					total += parseInt(val, 10)
					count++
				}
			})

			var average = Math.round(total/count)
			e.target.parent().one('strong').setContent(average)
		})
	})
}()