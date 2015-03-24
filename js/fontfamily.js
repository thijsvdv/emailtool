if (!RedactorPlugins) var RedactorPlugins = {};

(function($)
{
	RedactorPlugins.fontfamily = function()
	{
		return {
			init: function ()
			{
				var fonts = [ 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Monospace' ];
				var that = this;
				var dropdown = {};

				$.each(fonts, function(i, s)
				{
					dropdown[s.replace(/\ /g, '-')] = { title: s, func: function() { that.fontfamily.set(s); }, rel: s };
				});

				dropdown.remove = { title: 'Remove Font Family', func: that.fontfamily.reset };

				var button = this.button.add('fontfamily', 'Change Font Family');
				this.button.addDropdown(button, dropdown);

			},
			set: function (value)
			{
				$('.redactor-dropdown-' + value.replace(/\ /g, '-')).addClass('active').siblings().removeClass('active');
				this.inline.format('span', 'style', 'font-family:' + value + ';');
			},
			reset: function()
			{
				this.inline.removeStyleRule('font-family');
			}
		};
	};
})(jQuery);