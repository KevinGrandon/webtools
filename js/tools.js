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