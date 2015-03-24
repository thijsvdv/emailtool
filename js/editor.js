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
  //Variables
    var id, sender, item,
        difference = $(window).innerWidth()-1600,
        $slice,
        showHelp = true,
        backups = [],
        step = 0,
        selectCell = true;
    window.exisingCSS = "";
    window.exisingHTML = "";
    $window = $(window);

  //Prepare html
  help("Sleep &eacute;&eacute;n of meerdere sjablonen uit de linkerkolom naar het gebied in het midden. Wanneer een rechthoek met grijs gestippelde rand verschijnt, en daarin de boodschap 'Drop here' kunt u de blok plaatsen.<br><br>Klik op dit bericht om het te sluiten. Om het terug te openen, klik rechts op het vraagteken.");

  //Focus on an editable field
    $('input')
      .focus(function() {
        selectCell = false;
      })
      .blur(function() {
        selectCell = true;
      });

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
        // sender = ui.sender;
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
          $(ui.item).remove();
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
            cleanUpTables();

            backup();
          }
        }

        //Hide remove message
        $('.remove').hide();
      },
      change: function( event, ui ) {
        sender = ui.sender;
      },
      receive: function(event, ui) {
        help("Om een blok te verwijderen, sleep hem terug naar de linkerkolom.<br><br>Om een cell te bewerken, klik er op.");
      },
      update: function(event, ui) {
        sender = ui.sender;
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
      $form.find('textarea').each(function() {
        $('.mailing .field[data-id="' + $(this).attr('data-target') + '"]').html($(this).redactor('code.get'));
      });
    }

  //Color palette
    var bgcolor = $('.selected').children('table').attr('bgcolor') || "#fff";
    var lastColor = '#fff';
    $('.bgcolor').minicolors({
      changeDelay: 100,
      change: function(hex, opacity) {
        $('.selectedCell').attr('bgcolor', hex);
        lastColor = hex.toUpperCase();
      },
      hide: function() {
        console.log(lastColor);
        $('.used-colors').append('<span style="background: ' + lastColor.toUpperCase() + '" bgcolor="' + lastColor.toUpperCase() + '"></span>');
        backup();
      }
    });
    $('.bgcolor').minicolors('value', bgcolor);

    $('.bgcolor-input').bind('keyup', function() {
      if($(this).val().length === 4 || $(this).val().length === 7) {
        $('.bgcolor').minicolors('value', $(this).val());
      }
    });
    $('.bgcolor-input').bind('blur', function() {
      if($(this).val().length === 4 || $(this).val().length === 7) {
        var color = $(this).val().toUpperCase();
        $('.used-colors').append('<span style="background: ' + color + '" bgcolor="' + color + '"></span>');
        backup();
      };
    });

    $('.right .editor').on('click', '.used-colors span', function() {
      lastColor = $(this).attr('bgcolor').toUpperCase();
      $('.selectedCell').attr('bgcolor', lastColor);
      backup();
    });

  //Clicking on a cell should open the edit area
    $('.mailing').on('click', 'td', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if($(this).hasClass('selectedCell')) {
        $(this).removeClass('selectedCell').parents('td:first').trigger('click');
      } else {
        var $this = $(this),
            bgcolor = $this.attr('bgcolor') || "#fff",
            type = $this.attr('data-type'),
            cId = $this.attr('data-id');

        $slice = $this.parents('.mailing > .template');
        id = $slice.attr('id');

        $('.selectedCell').removeClass('selectedCell');
        $('.selectedRow').removeClass('selectedRow');
        $this.addClass('selectedCell').parent().addClass('selectedRow');
        $slice.addClass('selected').siblings().removeClass('selected');

        //Add form
          $('.right .editor .fields')
            .html('<form rel="' + id +'" action="upload.php" method="post" enctype="multipart/form-data"></form>');

        //Set bgcolor
          $('.bgcolor')
            .minicolors('value', bgcolor);

        //Add width fields
          var i = 0;
          $('.right .editor form[rel]').append('<div class="width-set"><label>Breedtes</label></div>');
          $('.right .editor form[rel] .width-set').append('<div class="tr-set" rel="' + i + '"></div>');
          // $('td.selectedCell').closest('table').closestDescendant('tr', true).each(function() {
          // $('td.selectedCell').closest('table').closestDescendant('tr', true).each(function() {
            var w = 0;
            $('.right .editor form[rel] .width-set').append('<div class="tr-set" rel="' + i + '"></div>');
            var j = 0;
            // $(this).closestDescendant('td', true).each(function() {
            $('td.selectedCell').parent('tr').children('td').each(function() {
              width = parseInt($(this).attr('width')) || $(this).width();
              $('.right .editor form[rel] .width-set .tr-set').eq(i).append('<input class="td-set" value="' + width + '" rel="' + j + '" />');
              w += width;
              j++;
            });
            $('.right .editor form[rel] .width-set .tr-set').eq(i).append(' = <span class="tr-width">' + w + '</span>');
            i++;
          // });

        //Add input fields and textareas
          if($this.hasClass('field')) {
            var delta = $this.data('id') || "",
                openTag = "",
                endTag = "",
                content = '';

            switch(type) {
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
                break;
            }

            if(type == 'image') {
              $('.right .editor form[rel]')
                .append('<div class="editor-img"><label>Afbeelding</label><' + openTag + ' id="' + type + id + delta + '" data-target="' + $this.data('id') + '"' + content + '</' + endTag + '><img src="' + $this.find('img').attr('src') + '"><button class="btn btn-small btn-danger img-delete">&times;</button><input type="text" class="img-w"> <input type="text" class="img-h"></div>')

                //Add editor
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
                        $('.selected img').eq($('.fields input[type="file"]').index(this)).attr('src', data.result.filelink);
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
            } else {
              $('.right .editor form[rel]')
                .append('<div><label>Tekst</label><' + openTag + ' id="' + type + id + delta + '" data-target="' + cId + '"' + content + '</' + endTag + '></div>')

                //Add editor
                  $('#text' + id + delta).addClass('is-redactor').redactor({
                    focus: false,
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
                    },
                    keyupCallback: function(e){
                      //This may be a bit heavy, to do this after every keyup
                      var current = this.selection.getCurrent();
                      var fontSize = 0,
                          fontFamily = "";

                      $('.redactor-dropdown-box-fontsize a.active, .redactor-dropdown-box-fontfamily a.active').removeClass('active');

                      try {
                        if(current.style['font-size'] !== undefined && current.style['font-size'] !== "") {
                          fontSize = parseInt(current.style['font-size'].replace('px',''));
                        } else if(current.parentNode.style['font-size'] !== undefined && current.parentNode.style['font-size'] !== "") {
                          fontSize = parseInt(current.parentNode.style['font-size'].replace('px',''));
                        } else if(current.parentNode.parentNode.style['font-size'] !== undefined && current.parentNode.parentNode.style['font-size'] !== "") {
                          fontSize = parseInt(current.parentNode.parentNode.style['font-size'].replace('px',''));
                        } else if(current.parentNode.parentNode.parentNode.style['font-size'] !== undefined && current.parentNode.parentNode.parentNode.style['font-size'] !== "") {
                          fontSize = parseInt(current.parentNode.parentNode.parentNode.style['font-size'].replace('px',''));
                        }

                        if(fontSize > 0) {
                          $('.redactor-dropdown-s' + fontSize).addClass('active');
                        }

                        if(current.style['font-family'] !== undefined && current.style['font-family'] !== "") {
                          fontFamily = current.style['font-family'];
                        } else if(current.parentNode.style['font-family'] !== undefined && current.parentNode.style['font-family'] !== "") {
                          fontFamily = current.parentNode.style['font-family'];
                        } else if(current.parentNode.parentNode.style['font-family'] !== undefined && current.parentNode.parentNode.style['font-family'] !== "") {
                          fontFamily = current.parentNode.parentNode.style['font-family'];
                        } else if(current.parentNode.parentNode.parentNode.style['font-family'] !== undefined && current.parentNode.parentNode.parentNode.style['font-family'] !== "") {
                          fontFamily = current.parentNode.parentNode.parentNode.style['font-family'];
                        }

                        if(fontFamily !== "") {
                          $('.redactor-dropdown-' + fontFamily.replace(/\ /g, '-')).addClass('active');
                        }

                      } catch(e) {};
                    },
                    clickCallback: function(e){
                      var current = this.selection.getCurrent();
                      var fontSize = 0,
                          fontFamily = "";

                      $('.redactor-dropdown-box-fontsize a.active, .redactor-dropdown-box-fontfamily a.active').removeClass('active');

                      try {
                        if(current.style['font-size'] !== undefined && current.style['font-size'] !== "") {
                          fontSize = parseInt(current.style['font-size'].replace('px',''));
                        } else if(current.parentNode.style['font-size'] !== undefined && current.parentNode.style['font-size'] !== "") {
                          fontSize = parseInt(current.parentNode.style['font-size'].replace('px',''));
                        } else if(current.parentNode.parentNode.style['font-size'] !== undefined && current.parentNode.parentNode.style['font-size'] !== "") {
                          fontSize = parseInt(current.parentNode.parentNode.style['font-size'].replace('px',''));
                        } else if(current.parentNode.parentNode.parentNode.style['font-size'] !== undefined && current.parentNode.parentNode.parentNode.style['font-size'] !== "") {
                          fontSize = parseInt(current.parentNode.parentNode.parentNode.style['font-size'].replace('px',''));
                        }

                        console.log(fontSize);
                        if(fontSize > 0) {
                          $('.redactor-dropdown-s' + fontSize).addClass('active');
                        }

                        if(current.style['font-family'] !== undefined && current.style['font-family'] !== "") {
                          fontFamily = current.style['font-family'];
                        } else if(current.parentNode.style['font-family'] !== undefined && current.parentNode.style['font-family'] !== "") {
                          fontFamily = current.parentNode.style['font-family'];
                        } else if(current.parentNode.parentNode.style['font-family'] !== undefined && current.parentNode.parentNode.style['font-family'] !== "") {
                          fontFamily = current.parentNode.parentNode.style['font-family'];
                        } else if(current.parentNode.parentNode.parentNode.style['font-family'] !== undefined && current.parentNode.parentNode.parentNode.style['font-family'] !== "") {
                          fontFamily = current.parentNode.parentNode.parentNode.style['font-family'];
                        }

                        console.log(fontFamily);
                        if(fontFamily !== "") {
                          $('.redactor-dropdown-' + fontFamily.replace(/\ /g, '-')).addClass('active');
                        }

                      } catch(e) {
                        console.log(fontSize, fontFamily);
                      };
                    }
                  });
            }
          } else {
            $('.right .editor form[rel]')
              .append('<div><label>Veld toevoegen</label></div>')
              .append('<button type="text" class="btn btn-small btn-info add-image">Add image</button><button type="text" class="btn btn-small btn-info add-text">Add text</button>');
          }

        //Add submit button
          $('.right .editor form[rel]')
            .append('<div class="save"><button type="submit" class="btn btn-success js-save">Opslaan</button></div>');

        //Show editor pane
          $('.editor')
            .fadeIn();

        //Move the canvas on small screens
          if(window.innerWidth < 1600) {
            $('.app').css({
              transform: 'translateX(' + difference + 'px)'
            });
          }
          $('.editor').fadeIn();

        }
    });

  //Toggle all / responsive / desktop templates
    $('.toggle .btn').click(function(e) {
      e.preventDefault();
      $(this).addClass('btn-info').siblings().removeClass('btn-info');
      $('.left').attr('rel', $(this).attr('rel'));
    });

  //Keydown event
    $('.right').on('keydown', '.td-set', function(e) {
      var w = v = parseInt($(this).val());
      $(this).siblings('.td-set').each(function() {
        w += parseInt($(this).val());
      });
      if(e.which === 38 || e.keyCode === 38) {
        if(w < 600)
          $('.td-set:focus').val(parseInt($('.td-set:focus').val()) + 10);
      }
      if(e.which === 40 || e.keyCode === 40) {
        if(v > 10)
          $('.td-set:focus').val(parseInt($('.td-set:focus').val()) - 10);
      }
      $(this).trigger('change');
    });

    $('body').on('keydown', function(e) {
      // e.preventDefault();
      selectCell = !$(e.target).hasClass('redactor-editor');

      if($('.selectedCell').length > 0 && selectCell) {
        if(e.which === 37 || e.keyCode === 37) {
          if($('.selectedCell').prev('td')) $('.selectedCell').prev('td').trigger('click');
           else e.which = 38;
        }
        if(e.which === 39 || e.keyCode === 39) {
          if($('.selectedCell').next('td')) $('.selectedCell').next('td').trigger('click');
        }
        if(e.which === 38 || e.keyCode === 38) {
          e.preventDefault();
          if($('.selectedCell').find('td').length > 0) {
            $('.selectedCell').find('td:first').trigger('click');
          }
          if($('.selectedCell').parent('tr').prev('tr')) $('.selectedCell').parent('tr').prev('tr').children('td:first').trigger('click');
            else if($('.selectedCell')) {

            }
        }
        if(e.which === 40 || e.keyCode === 40) {
          e.preventDefault();
          if($('.selectedCell').parent('tr').next('tr')) $('.selectedCell').parent('tr').next('tr').children('td:first').trigger('click');
        }
      }
    });

  //Add image
    $('.right').on('click', '.add-image', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell')
        .addClass('field')
        .attr('data-type', 'image')
        .attr('data-id', Math.floor(Math.random()*1000))
        .append('<img src="//placehold.it/200x100&text=click+to+replace" width="' + $('.selectedCell').width() + '">')
        .trigger('click');
    });

  //Add text
    $('.right').on('click', '.add-text', function(e) {
      $('.selectedCell')
        .addClass('field')
        .attr('data-type', 'text')
        .attr('data-id', Math.floor(Math.random()*1000))
        .append('<p>Add your text</p>')

      console.log($('.selectedCell').attr('data-type'));

      $('.selectedCell').trigger('click');
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
        .trigger('click');
      // $('.fields').empty();
      // $('.editor').fadeOut();
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
      $('.selectedCell').before('<td width="20" height="20"></td>');//.closest('.template').trigger('click');
    });
    $('.add-cell-after').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').after('<td width="20" height="20"></td>');//.closest('.template').trigger('click');
    });

  //Remove cell
    $('.remove-cell').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').remove();
      $('.fields').empty();
      $('.editor').fadeOut();
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
      .on('mouseover', '.selectedRow > td', function(e) {
        // e.stopPropagation();
        $('.right .tr-set .td-set').eq($(this).parent().children('td').index(this)).addClass('hover');
      })
      .on('mouseout', '.selectedRow > td', function(e) {
        // e.stopPropagation();
        $('.right .tr-set .td-set').eq($(this).parent().children('td').index(this)).removeClass('hover');
      });

  //Change td widths
    $('.right')
      .on('change', '.td-set', function() {
        var w = 0,
            newWidth = parseInt($(this).val());
        //Calculate total
        w += newWidth;
        var that = this;
        $(this).siblings('.td-set').each(function() {
          w += parseInt($(this).val());
        });
        if(w >= 600) {
          w = 600;
        }
        $('td.selectedCell').closest('table')
          .closestDescendant('td', true).eq($(this).attr('rel'))
          .attr('width', newWidth)
          // .find('table, td').attr('width', newWidth)
          .find('img').attr('width', newWidth)
                      .attr('height', newWidth*parseInt($(this).attr('data-h'))/parseInt($(this).attr('data-w')));
        $(that).siblings('.tr-width').text(w);
      })
      .on('mouseover', '.td-set', function(e) {
        $('td.selectedCell').parent()
          .children('td').eq($(this).attr('rel'))
          .addClass('hover')
      })
      .on('mouseout', '.td-set', function(e) {
        $('td.selectedCell').parent()
          .children('td').eq($(this).attr('rel'))
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
    // $('.right').on('click', '.js-delete', function(e) {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   if(window.confirm("Weet u zeker?")) {
    //     $('.slice#' + id).remove();
    //     $('.editor').fadeOut();
    //     $('.fields').empty();
    //   }
    // });

  //Helper functions & Utility
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

    function backup() {
      backups.push($('.center .mailing').html());
      step++;
      // console.log(step);
    }

    function cleanUpTables() {
      $('.mailing table').each(function() {
        $(this).attr('cellpadding', '0').attr('cellspacing', '0').attr('border', '0');
      })
    }

    function help(msg) {
      // var test = parseInt(Math.random(10)*10);
      $('#help').html(msg)
      if(showHelp == true) {
        $('#help').addClass('show');
      }
    }

    $('#help, .js-help').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('#help').toggleClass('show');
    });

    $(window).resize(function() {
      difference = $(window).innerWidth()-1600;
    });

  //Generate code event
    $('.js-generate').on('click', function(e) {
      e.preventDefault();
      $code = $('.app > .center').clone();
      var hasResponsive = false;
      $code.find('.template').each(function() {
        if($(this).hasClass('responsive')) {
          hasResponsive = true;
        }
        $(this).children().unwrap();
      });
      $code.find('.ui-resizable-handle').remove();

      if(hasResponsive) {
        $('#mailTemplate .base-css').html($('#base-css').html());
      } else {
        $('#mailTemplate .base-css').html();
      }

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

  //Mobile test
    $('.js-test').on('click', function(e) {
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
      // console.log(html);

      var newIframe = document.createElement('iframe');
      newIframe.width = '320';
      newIframe.height = '480';
      // newIframe.src = 'about:blank';
      document.getElementById('mobile').appendChild(newIframe);
      console.log(newIframe);
      // newIframe.contentWindow.document.open('text/htmlreplace');
      // newIframe.contentWindow.document.write(html);
      // newIframe.contentWindow.document.close();

      newIframe.srcdoc = html;

      $('#mobile').resizable({
        minWidth: 320,
        minHeight: 480,
      }).fadeIn();
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

      cleanUpTables();

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
      // $('.tools:visible').fadeOut();
      $('.selectedCell').removeClass('selectedCell');

      $('.editor').fadeOut();
      $('.fields').empty();
      $('.selected').removeClass('selected');
      $('.selectedCell').removeClass('selectedCell');
      $('.app').css({
        transform: 'translateX(0px)'
      });
      $('#mobile').fadeOut();
    });

  //Undo / redo
    $('.js-back').click(function(e) {
      e.preventDefault();
      step--;
      try {
        $('.mailing').html(backups[step]);
      } catch(e) {}
    });
    $('.js-forward').click(function(e) {
      e.preventDefault();
      step++;
      try {
        $('.mailing').html(backups[step]);
      } catch(e) {}
    });

  $('body').resizable();

})(jQuery);