/*!
 * .closestDescendant( selector [, findAll ] )
 * https://github.com/tlindig/jquery-closest-descendant
 *
 * v0.1.2 - 2014-02-17
 *
 * Copyright (c) 2014 Tobias Lindig
 * http://tlindig.de/
 *
 * License: MIT
 *
 * Author: Tobias Lindig <dev@tlindig.de>
 */
!function(a){a.fn.closestDescendant=function(b,c){if(!b||""===b)return a();c=c?!0:!1;var d=a();return this.each(function(){var e=a(this),f=[];for(f.push(e);f.length>0;)for(var g=f.shift(),h=g.children(),i=0;i<h.length;++i){var j=a(h[i]);if(j.is(b)){if(d.push(j[0]),!c)return!1}else f.push(j)}}),d}}(jQuery);

(function($) {
  var id, sender, item,
      difference = $(window).innerWidth()-1600,
      $slice;
  window.exisingCSS = "";
  window.exisingHTML = "";
  $window = $(window);

  $(window).resize(function() {
    difference = $(window).innerWidth()-1600;
  });

  $('body').append('<div id="progress" class="progress"><div class="progress-bar progress-bar-success"></div></div><div id="files" class="files"></div>');

  //Sortable
    $('.connectedSortable').sortable({
      items: '.template',
      placeholder: "sortable-placeholder",
      connectWith: ".connectedSortable",
      // revert: true,
      clone: true,
      forceHelperSize: true,
      opacity: 0.5,
      zIndex: 9999,
      start: function(event, ui) {
        //If dragging from template area onto the mailing tempate, do not
        //remove from source list => clone item, remove style (or it will
        //mess up layout and insert after current position
        if(!$(ui.item).parent().hasClass('mailing')) {
          $(ui.item).clone().removeAttr('style').insertAfter($(ui.item));

          //Being a child of .templates => scale(0.5) => messes up nice dragging,
          //append it to .left instead
          $(ui.item).appendTo($('.left'));
        }
      },
      over: function(event, ui) {
        $(ui.item).appendTo($('.left'));
        if($(event.target).hasClass('templates')) {
          //Dragging from mailing area to left? Show a delete sign!
          $('.remove').show();
        }
      },
      beforeStop: function(event, ui) {},
      stop: function(event, ui) {
        if(!$(ui.item).parent().hasClass('mailing') && sender == null) {
          //Dropping item from mailing back on template are = delete it!
          // $(ui.item).remove();
          $('.js-delete').trigger('click');

        } else {
          if(!$(ui.item).hasClass("processed")) {
            //Dropping a template on the mailing should process it once,
            //so add a processed class
            $(ui.item).addClass("processed");
            $(ui.item).find('p, span, h1, h2, h3, h4, h5, h6, h7, blockquote').closest('td').each(function() {
              $(this).addClass("field").attr('data-type', 'text').attr('data-id', Math.floor(Math.random()*1000));
            });
            $(ui.item).find('img').closest('td').each(function() {
              $(this).addClass("field").attr('data-type', 'image').attr('data-id', Math.floor(Math.random()*1000));
            });
          }
        }

        //Hide remove message
        $('.remove').hide();
      },
      change: function( event, ui ) {
        sender = ui.sender;
      },
      receive: function(event, ui) {},
      update: function(event, ui) {
        if($(ui.sender).hasClass('mailing')) {
          // REMOVE FROM MAILING, DO NOT ADD TO SIDEBAR
          $(ui.item).remove();
        }

        $(this).find('.placeholder').remove();
        var sid = "slice" + Math.floor(Math.random()*1000);

        $(ui.item)
          .addClass('slice')
          .attr('id', sid)
          .children('table')
          .resizable({
            resize: function(event, ui) {
              $(this).attr('height', ui.size.height);
            }
          })
      }
    })

  //Save function
    var save = function(that) {
      var $form = $(that).closest('form');

      // console.log(id);
      // console.log($(this).attr('id').replace($(this).attr('name'), ''));

      // $form.find('input').each(function() {
      //   $('#' + id + ' .field[data-label="' + $(this).data('target') + '"]').html($(this).val());
      // });

      $form.find('textarea').each(function() {
        $('.mailing .field[data-id="' + $(this).data('target') + '"]').html($(this).redactor('code.get'));
      });
    }

  // Add color handle
    $('.right .editor')
      .prepend('<div class="colors"><label>Kleuren</label>Achtergrondkleur: <div type="text" class="bgcolor" value="' + bgcolor + '"></div><div class="used-colors"></div></div>')

    var bgcolor = $('.selected').children('table').attr('bgcolor') || "#fff";
    var lastColor = '#fff';
    $('.bgcolor').minicolors({
      changeDelay: 100,
      change: function(hex, opacity) {
        // console.log(hex + ' - ' + opacity);
        $('.selected').children('table').attr('bgcolor', hex);
        lastColor = hex.toUpperCase();
      },
      hide: function() {
        $('.used-colors').append('<span style="background: ' + lastColor.toUpperCase() + '" bgcolor="' + lastColor.toUpperCase() + '"></span>');
      }
    });
    $('.bgcolor').minicolors('value', bgcolor);

    $('.right .editor').on('click', '.used-colors span', function() {
      lastColor = $(this).attr('bgcolor').toUpperCase();
      $('.selected').children('table').attr('bgcolor', lastColor);
    });


  // Clicking on a template should open the edit area
  $('.mailing').on('click', '.template', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $slice = $(this);
    id = $slice.attr('id');
    var $this = $(this);
    var bgcolor = $slice.children('table').attr('bgcolor');

    $slice.addClass('selected').siblings().removeClass('selected');

    // Create a documentFragment
      var frag = document.createDocumentFragment();
      var addedPerformance = (window.location.hash === '#true') ? true : false;

    // Add form
      if(addedPerformance) {
        frag.appendChild($('<form rel="' + id +'" action="upload.php" method="post" enctype="multipart/form-data"></form>')[0]);
      } else {
        $('.right .editor .pane').html('<form rel="' + id +'" action="upload.php" method="post" enctype="multipart/form-data"></form>')
      }

    // Set bgcolor
      $('.bgcolor')
        .minicolors('value', bgcolor);

    // Add width fields
      var i = 0;
      if(addedPerformance) {
        frag.querySelector('form[rel]').appendChild($('<div class="width-set"><label>Breedtes</label></div>')[0]);
      } else {
        $('.right .editor form[rel]').append('<div class="width-set"><label>Breedtes</label></div>');
      }

      if(addedPerformance) {
        $slice.closestDescendant('tr', true).each(function() {
          var w = 0;
          frag.querySelector('form[rel] .width-set').appendChild($('<div class="tr-set" rel="' + i + '"></div>')[0]);
          var j = 0;
          $(this).closestDescendant('td', true).each(function() {
            width = parseInt($(this).attr('width')) || $(this).width();
            frag.querySelector('form[rel] .width-set .tr-set').appendChild($('<input class="td-set" value="' + width + '" rel="' + j + '" />')[0]);
            w += width;
            j++;
          });
          frag.querySelector('form[rel] .width-set .tr-set').appendChild($('<span class="tr-width">' + w + '</span>')[0]);
          i++;
        });
      } else {
        $slice.closestDescendant('tr', true).each(function() {
          var w = 0;
          $('.right .editor form[rel] .width-set').append('<div class="tr-set" rel="' + i + '"></div>');
          var j = 0;
          $(this).closestDescendant('td', true).each(function() {
            width = parseInt($(this).attr('width')) || $(this).width();
            $('.right .editor form[rel] .width-set .tr-set').eq(i).append('<input class="td-set" value="' + width + '" rel="' + j + '" />');
            w += width;
            j++;
          });
          $('.right .editor form[rel] .width-set .tr-set').eq(i).append(' = <span class="tr-width">' + w + '</span>');
          i++;
        });
      }

    // Add input fields and textareas
      $this.find('.field').each(function() {
        var $this = $(this),
            delta = $this.data('id') || "",
            openTag = "",
            endTag = "",
            content = '';

        switch($this.data('type')) {
          case "textarea":
            openTag = endTag = "textarea";
            content = '>' + $this.html();
            break;
          case "text":
            openTag = endTag = "textarea";
            content = '>' + $this.html();
            break;
          case "image":
            openTag = 'input type="file" id="fileupload"';
            endTag = 'input';
            content = ">";
            // openTag = endTag = "textarea";
            // content = '>' + $this.html();
            break;
          default:
            // openTag = 'input type="text"';
            // endTag = 'input';
            // content = ' value="' + $this.text() + '">';
        }

        if(addedPerformance) {
          frag.querySelector('form[rel]').appendChild($('<div><label>' + $this.data('type') + '</label><' + openTag + ' id="' + $this.data('type') + id + delta + '" data-target="' + $this.data('id') + '"' + content + '</' + endTag + '></div>')[0]);
        } else {

          if($this.data('type') == 'image') {
            $('.right .editor form[rel]')
              .append('<div class="editor-img"><label>' + $this.data('type') + '</label><' + openTag + ' id="' + $this.data('type') + id + delta + '" data-target="' + $this.data('id') + '"' + content + '</' + endTag + '><img src="' + $this.find('img').attr('src') + '"><button class="btn btn-small btn-danger img-delete">&times;</button><input type="text" class="img-w"> <input type="text" class="img-h"></div>')
          } else {
            $('.right .editor form[rel]')
              .append('<div><label>' + $this.data('type') + '</label><' + openTag + ' id="' + $this.data('type') + id + delta + '" data-target="' + $this.data('id') + '"' + content + '</' + endTag + '></div>')
          }
        }
      });

    //Add submit button
      if(addedPerformance) {
        frag.querySelector('form[rel]').appendChild($('<div><input type="submit" class="btn btn-success js-save" value="Opslaan"> <button class="btn btn-danger js-delete">delete</button></div>')[0]);
        $('.right .editor .pane').html(frag);
      } else {
        $('.right .editor form[rel]').append('<div><input type="submit" class="btn btn-success js-save" value="Opslaan"> <button class="btn btn-danger js-delete">delete</button></div>');
      }

    //redactor
      $this.find('.field').each(function() {
        var $this = $(this),
            delta = $this.data('id') || "";

        if($this.data('type') === "text") { //Changed to text from textarea
          $('#text' + id + delta).redactor({
            focus: true,
            plugins: ['fontcolor', 'fontfamily', 'fontsize'],
            linebreaks: false,
            paragraphize: false,
            linebreaks: true,
            changeCallback: function()
            {
                $('#text' + id + delta).val(this.code.get());
                save('.js-save');
            },
            initCallback: function()
            {
                //White text is unreadable on a white background: fix this
                if(this.code.get().indexOf('#FFF') !== -1 || this.code.get().indexOf('#fff') !== -1 || this.code.get().indexOf('rgb(255, 255, 255)') !== -1) {
                  this.$box.addClass('dark');
                }
            }
          });
        }

        if($(this).data('type') === "image") {
          // Change this to the location of your server-side upload handler:
          var url = "upload.php";
          $('input[type="file"]').each(function() {
            $(this).fileupload({
              url: url,
              dataType: 'json',
              done: function (e, data) {
                $(this).next('img')
                  .attr('src', data.result.filelink)
                  .load(function() {
                    var size = getOriginalWidthOfImg(this);
                    $(this).attr('data-w', size.w).attr('data-h', size.h);
                    $('.selectedCell img').attr('data-w', size.w).attr('data-h', size.h);

                  });
                $('.selected img').eq($('.pane input[type="file"]').index(this)).attr('src', data.result.filelink);
                $('#progress').fadeOut();
              },
              progressall: function (e, data) {
                  var progress = parseInt(data.loaded / data.total * 100, 10);
                  $('#progress .progress-bar').css(
                      'width',
                      progress + '%'
                  );
              }
            })
            .prop('disabled', !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : 'disabled')
            .on('change', function() {
              $('#progress').fadeIn();
            })
          });
        }

        $('.editor').fadeIn();
    });

    //Move the canvas on small screens
      if(window.innerWidth < 1600) {
        $('.app').css({
          transform: 'translateX(' + difference + 'px)'
        });
      }
      $('.editor').fadeIn();
  });

  $('.mailing').on('click', 'td', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $('.selectedCell').not($(this)).removeClass('selectedCell');
    $(this).addClass('selectedCell');

    if(isEmpty($(this))) {
      $('.tools.tools-remove').hide();
      $('.tools.tools-add').css({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
      }).fadeToggle();
    } else {
      $('.tools.tools-add').hide();
      $('.tools.tools-remove').css({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
      }).fadeToggle();
    }

    //Only the deepest clicked td should get "selectedClass", so no bubbeling!
    //But stopPropagation will stop the click event on the template from firing,
    //so let's fire it manually
    $(this).closest('.template').trigger('click');
  });

  // $('.mailing').on('click', function(e) {
  //   console.log($(e.target)[0].tagName);
  //   var tag = $(e.target)[0].tagName;
  //   switch(tag) {
  //     case "TD":
  //       $('.selectedCell').not($(this)).removeClass('selectedCell');
  //       $(this).addClass('selectedCell');
  //       $(this).closest('.template').trigger('click');
  //       break;
  //     case "DIV":
  //       console.log(e);
  //       console.log($(e.target));
  //       if($(e.target).hasClass('template')) {
  //         $slice = $(e.target);
  //         id = $slice.attr('id');
  //         var $this = $slice;
  //         var bgcolor = $slice.children('table').attr('bgcolor');
  //         $slice.addClass('selected').siblings().removeClass('selected');
  //       }
  //       break;
  //   }
  // });

  $('.toggle .btn').click(function(e) {
    e.preventDefault();
    $(this).addClass('btn-info').siblings().removeClass('btn-info');
    $('.left').attr('rel', $(this).attr('rel'));
  });

  //Keydown event
    $('.right').on('keydown', '.td-set', function(e) {
      // console.log(e);
      if(e.which === 38 || e.keyCode === 38) {
        $('.td-set:focus').val(parseInt($('.td-set:focus').val()) + 10);
      }
      if(e.which === 40 || e.keyCode === 40) {
        $('.td-set:focus').val(parseInt($('.td-set:focus').val()) - 10);
      }
      $(this).trigger('change');
    });

  //Add image
    $('.add-image').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell')
        .addClass('field')
        .attr('data-type', 'image')
        .attr('data-id', Math.floor(Math.random()*1000))
        .append('<img src="//placehold.it/200x100&text=click+to+replace" width="' + $('.selectedCell').width() + '">')
        .closest('.template').trigger('click');
    });

  //Add text
    $('.add-text').click(function(e) {
      $('.selectedCell')
        .addClass('field')
        .attr('data-type', 'text')
        .attr('data-id', Math.floor(Math.random()*1000))
        .append('<p>Add your text</p>')
        .closest('.template').trigger('click');
    });

  //Remove item
    $('.remove-item').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell')
        .removeClass('field')
        .removeAttr('data-type')
        .removeAttr('data-id')
        .empty()
        .closest('.template').trigger('click');
      $('.pane').empty();
      $('.editor, .tools').fadeOut();
    });

  //Set specs
    $('.set-spec').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').attr($(this).data('attr'), $(this).data('value'));
    });

  //Add cells
    $('.add-cell-before').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').before('<td width="20" height="20"></td>').closest('.template').trigger('click');
    });
    $('.add-cell-after').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').after('<td width="20" height="20"></td>').closest('.template').trigger('click');
    });

  //Remove cell
    $('.remove-cell').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').remove();
      $('.pane').empty();
      $('.editor, .tools').fadeOut();
    });

  //Add template
    $('.add-template').click(function() {
      $('<div class="template"></div>').insertBefore('.templates .edit');
      $('.selected')
        .children()
        .clone()
        .appendTo('.templates .template:last');
    });

  //Hover td
    $('.mailing')
      .on('mouseover', '> div > table > tbody > tr > td', function(e) {
        $('.right .tr-set .td-set').eq($('.mailing > div > table > tbody > tr > td').index(this)).addClass('hover');

      })
      .on('mouseout', '> div > table > tbody > tr > td', function(e) {
        $('.right .tr-set .td-set').eq($('.mailing > div > table > tbody > tr > td').index(this)).removeClass('hover');
      })

  //Change td widths
    $('.right')
      .on('change', '.td-set', function() {
        var w = 0;
        $slice.closestDescendant('tr', true).eq($(this).parent().attr('rel'))
          .closestDescendant('td', true).eq($(this).attr('rel'))
          .attr('width', $(this).val())
          .find('table, td')
          .attr('width', $(this).val())

        //Calculate total
        w += parseInt($(this).val());
        var that = this;
        $(this).siblings('.td-set').each(function() {
          w += parseInt($(this).val());
        });

        $(that).siblings('.tr-width').text(w);
      })
      .on('mouseover', '.td-set', function() {
        $slice.closestDescendant('tr', true).eq($(this).parent().attr('rel'))
          .closestDescendant('td', true).eq($(this).attr('rel'))
          .addClass('hover')
      })
      .on('mouseout', '.td-set', function() {
        $slice.closestDescendant('tr', true).eq($(this).parent().attr('rel'))
          .closestDescendant('td', true).eq($(this).attr('rel'))
          .removeClass('hover')
      })

  //Image delete button
    $('.right').on('click', '.img-delete', function(e) {
      e.stopPropagation();
      e.preventDefault();

      if(window.confirm("Zeker?")) {
        $('.selected img').eq($('.right input[type="file"]').index($(this).siblings('input[type="file"]'))).unwrap('a').remove();
      }
    });

  //Save click event
    $('.right').on('click', '.js-save', function(e) {
      e.preventDefault();
      save(this);
      $('.selected').removeClass('selected');

      $('.app').css({
        transform: 'translateX(0px)'
      });
      $('.editor').fadeOut();
    });

  //Keyup event
    $('.right').on('keyup', 'input', function(e) {
      save('.js-save');
    });

  //Delete event
    $('.right').on('click', '.js-delete', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if(window.confirm("Weet u zeker?")) {
        $('.slice#' + id).remove();
        $('.editor').fadeOut();
        $('.pane').empty();
      }
    });

  //Helper functions
    function escapeRegExp(string) {
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    function replaceAll(string, find, replace) {
      return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }

    function isEmpty( el ){
      return !$.trim(el.html())
    }

    function getOriginalWidthOfImg(img_element) {
      var t = new Image();
      t.src = (img_element.getAttribute ? img_element.getAttribute("src") : false) || img_element.src;
      return { 'w': t.width, 'h': t.height };
    }

  //Generate code event
    $('.js-generate').on('click', function(e) {
      e.preventDefault();
      $code = $('.app > .center').clone();
      $code.find('.template').each(function() {
        $(this).children().unwrap();
      });
      $code.find('.ui-resizable-handle').remove();

      $('#mailTemplate #placeholder').html($code);
      var html = $("#mailTemplate").html();
      html = html.replace(/\[\{/g, '<');
      html = html.replace(/\}\]/g, '>');

      var w = window.open();
          w.document.open();
          w.document.write(html);
          w.document.close();

      var x = window.open();
      $(x.document.body).text(html);
    });

  //Toggle insert template area
    $('.js-show-pane').click(function() {
      $('#insertTemplate').toggleClass('show');
    });

  //Load HTML into mailing
    $('.js-insert').click(function() {
      var code = $('#insertTemplate textarea').val();

      $('#insertedTemplateHTML').html(code);
      var html = "";
      if($('#insertedTemplateHTML').find(".mailing").length === 1) {
        //One of our own templates
        html = $('#insertedTemplateHTML').find('.mailing').html();


      } else {
        //Adapt the template
        console.log($('#insertedTemplateHTML').children('table').length);
        if($('#insertedTemplateHTML').children('table').length === 1) {
          $('#insertedTemplateHTML').children('table').find('table:first').addClass('deviceWidth').siblings().addClass('deviceWidth');
        }
        html = $('#insertedTemplateHTML').find('.deviceWidth:first').parent().html();
      }

      $('#insertedTemplateHTML').find('.deviceWidth:first').parent().children('.deviceWidth').each(function() {
        $(this).wrap('<div class="template"></div>');
      });

      $('.mailing').html(html);

      $('#insertedTemplateHTML').find('.template').each(function() {
        $(this).clone().appendTo('.templates');
      });

      $('.mailing').find('.deviceWidth:first').parent().children('.deviceWidth').each(function() {
        var sid = "slice" + Math.floor(Math.random()*1000);
        $(this).wrap('<div class="template slice" id="' + sid + '"></div>');

        //Process the items
        if(!$(this).hasClass("processed")) {
          //Dropping a template on the mailing should process it once,
          //so add a processed class
          $(this).addClass("processed");
          $(this).find('p, span, h1, h2, h3, h4, h5, h6, h7, blockquote').closest('td').each(function() {
            $(this).addClass("field").attr('data-type', 'text').attr('data-id', Math.floor(Math.random()*1000));
          });
          $(this).find('img').closest('td').each(function() {
            $(this).addClass("field").attr('data-type', 'image').attr('data-id', Math.floor(Math.random()*1000));
          });
        }
      });

      // $('.center').closest('td').addClass('mailing');
      $('#insertTemplate').removeClass('show');
    });

  //Click anywhere should hide tools
    $('.center').on('click', function(e) {
      $('.tools:visible').fadeOut();
      $('.selectedCell').removeClass('selectedCell');

      $('.editor').fadeOut();
      $('.pane').empty();
      $('.selected').removeClass('selected');
      $('.selectedCell').removeClass('selectedCell');
      $('.app').css({
        transform: 'translateX(0px)'
      });
    });
})(jQuery);