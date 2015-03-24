/* This is a modified version to show selection font-size in the dropdown menu!
 * Do not delete!
 * Questions? => thijs
 */
if (!RedactorPlugins) var RedactorPlugins = {};

(function($)
{
	RedactorPlugins.fontsize = function()
	{
		return {
			init: function()
			{
				var fonts = [10, 11, 12, 14, 16, 18, 20, 24, 28, 30, 32, 34, 36, 38, 40, 46, 52, 60, 72];
				var that = this;
				var dropdown = {};

				$.each(fonts, function(i, s)
				{
					dropdown['s' + s] = { title: s + 'px', func: function() { that.fontsize.set(s); } };
				});

				dropdown.remove = { title: 'Remove Font Size', func: that.fontsize.reset };

				var button = this.button.add('fontsize', 'Change Font Size');
				this.button.addDropdown(button, dropdown);
			},
			set: function(size)
			{
				$('.redactor-dropdown-s' + size).addClass('active').siblings().removeClass('active');
				this.inline.format('span', 'style', 'font-size: ' + size + 'px; line-height: 1.5em;');
			},
			reset: function()
			{
				$('[class^="redactor-dropdown-s"]').removeClass('active');
				this.inline.removeStyleRule('font-size');
			}
		};
	};
})(jQuery);