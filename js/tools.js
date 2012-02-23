var currency = function(num) {
	num = num.toString().replace(/\$|\,/g,'');
	if(isNaN(num))
	num = "0";
	sign = (num == (num = Math.abs(num)));
	num = Math.floor(num*100+0.50000000001);
	cents = num%100;
	num = Math.floor(num/100).toString();
	if(cents<10)
	cents = "0" + cents;
	for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
	num = num.substring(0,num.length-(4*i+3))+','+
	num.substring(num.length-(4*i+3));
	return (((sign)?'':'-') + '$' + num + '.' + cents);
};

n.ready(function() {
	n.one('.nav-list').on('click', function(e) {
		var tool = e.target.data('tool');
		if (!tool) { return; }

		e.stop();
		e.target.parent().parent().all('li').removeClass('active');
		e.target.parent().addClass('active');

		n.all('div[data-tool-content]').each(function(el){
			el.setStyle('display', 'none');
		});

		n.one('div[data-tool-content="' + tool + '"]').setStyle('display', '');
	});
});