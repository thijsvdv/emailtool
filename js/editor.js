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
    var id, sender, item, editor,
        difference = $(window).innerWidth()-1600,
        $slice,
        showHelp = false,
        backups = [],
        step = 0,
        selectCell = true,
        saves = [],
        refresh = false,
        editingCSS = false;
    window.exisingCSS = "";
    window.exisingHTML = "";
    $window = $(window);

    var env = location.search.substr(1);
    console.log(env);

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
        // $('.mailing .field[data-id="' + $(this).attr('data-target') + '"]').html($(this).redactor('code.get'));
        $('.mailing .field[data-id="' + $(this).attr('data-target') + '"]').html(editor.getData());
      });
    }

  //Image select function
    $('.mailing').on('click', 'img', function(e) {
      $('.selectedImg').removeClass('selectedImg');
      $(this).addClass('selectedImg');
    });

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
      var _this = this;
      if($(this).hasClass('selectedCell') && !refresh) {
        $(this).removeClass('selectedCell').parents('td:first').trigger('click');
      } else {
        refresh = false;
        var $this = $(this),
            bgcolor = $this.attr('bgcolor') || "#fff",
            type = $this.attr('data-type'),
            colspan = $this.attr('colspan') || 1,
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

        //Add colspan fields
          $('.right .editor form[rel]').append('<div class="colspan-set"><label>Colspan</label></div>');
          $('.right .editor form[rel]').append('<div class="colspan"><input class="td-colspan" value="' + colspan + '"></div>');

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
                .append('<div class=""><label>Klassen</label><input type="text" class="img-c" value="' + $('.selectedCell').find('img').attr('class') +'"></div>')

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
                            $('.selectedCell img').attr('data-w', size.w).attr('data-h', size.h).css({
                              'width': '100%',
                              'height': 'auto'
                            });
                          });
                        $('.selectedCell img').attr('src', data.result.filelink);
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

                editor = CKEDITOR.replace( 'text' + id + delta, {
                  enterMode: CKEDITOR.ENTER_BR,
                  toolbar: [
                              ['Source'],
                              ['PasteText','Undo','Redo','SpecialChar'],
                              ['Link','Unlink','Anchor','Linkit','LinkToNode', 'LinkToMenu'],
                              '/',
                              ['Bold','Italic','Underline','Strike','-','Subscript','Superscript','-','RemoveFormat'],
                              ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
                              ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
                              '/',
                              ['Format','Font','FontSize','lineheight'],
                              ['TextColor','BGColor'],
                              // ['Maximize', 'ShowBlocks'],
                            ]
                });

                editor.on("change", function(evt) {
                  $('#text' + id + delta).val(evt.editor.getData());
                  save('.js-save');
                });


                //Set BG color of editor... FANCY! :)
                  var getBgColor = function(elem) {
                    if(elem.bgColor === "" || elem.bgColor === undefined) {
                      if(elem.parentNode !== undefined) {
                        return getBgColor(elem.parentNode);
                      } else {
                        return "";
                      }
                    } else {
                      return elem.bgColor;
                    }
                  }

                  var settingBG = setInterval(function() {
                    if($('.cke_wysiwyg_frame').length > 0) {
                      clearInterval(settingBG);
                      $('.cke_wysiwyg_frame').css('background', getBgColor(_this));
                    }
                  }, 500);

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

  //Add class to image
    $('.right').on('blur', '.img-c', function() {
      $('.selectedCell').find('img').attr('class', $(this).val() || "");
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
      //Arrow keys
        if(e.which === 38 || e.keyCode === 38) {
          if(w < parseInt($('.selectedRow').closest('table').attr('width')))
            $('.td-set:focus').val(parseInt($('.td-set:focus').val()) + 10);
        }
        if(e.which === 40 || e.keyCode === 40) {
          if(v > 10)
            $('.td-set:focus').val(parseInt($('.td-set:focus').val()) - 10);
        }
      $(this).trigger('change');
    });

    $('.right').on('keydown', '.td-colspan', function(e) {
      var colspan = parseInt($(this).val());
      $('.selectedCell').attr('colspan', colspan);
    });


    $('body').on('keydown', function(e) {
      // e.preventDefault();
      // selectCell = !$(e.target).hasClass('redactor-editor');
      // console.log(selectCell);
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
        .append('<img src="//placehold.it/200x100&text=click+to+replace" width="' + $('.selectedCell').outerWidth() + '">')
        .trigger('click');

    });

  //Add text
    $('.right').on('click', '.add-text', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell')
        .addClass('tekstitem')
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

  //Add table
    $('.add-table').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').append('<table width="' + $('.selectedCell').attr('width') +'" border="0" cellspacing="0" cellpadding="0" bgcolor="#F3F3F3"><tr><td valign="top" width="' + $('.selectedCell').attr('width') + '"></td></tr></table>');//.closest('.template').trigger('click');
    });

  //Add rows
    $('.add-row-before').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedRow').before('<tr><td width="' + $('.selectedCell').closest('table').attr('width') + '" colspan="' + parseInt($('.selectedCell').siblings('td').length + 1) + '"></td></tr>');//.closest('.template').trigger('click');
    });
    $('.add-row-after').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedRow').after('<tr><td width="' + $('.selectedCell').closest('table').attr('width') + '" colspan="' + parseInt($('.selectedCell').siblings('td').length + 1) + '"></td></tr>');//.closest('.template').trigger('click');
    });

  //Add cells
    $('.add-cell-before').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      refresh = true;
      $('.selectedCell').before('<td width="20"></td>').trigger('click');
    });
    $('.add-cell-after').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      refresh = true;
      $('.selectedCell').after('<td width="20"></td>').trigger('click');
    });

  //Remove table
    $('.remove-table').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').closest('table').remove();
      $('.fields').empty();
      $('.editor').fadeOut();
    });

  //Remove row
    $('.remove-row').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').closest('tr').remove();
      $('.fields').empty();
      $('.editor').fadeOut();
    });

  //Remove cell
    $('.remove-cell').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.selectedCell').remove();
      $('.fields').empty();
      $('.editor').fadeOut();
    });

  //Add as template
    /* The selected piece will be added to the template list on the left to be re-used. */
    $('.add-template').click(function() {
      $('<div class="template"></div>').insertBefore('.templates .edit');
      $('.selected')
        .children()
        .clone()
        .appendTo('.templates .template:last');
    });

  //Hover td
    /* Show guidelines on templates */
    $('.mailing')
      .on('mouseover', '.selectedRow > td', function(e) {
        $('.right .tr-set .td-set').eq($(this).parent().children('td').index(this)).addClass('hover');
      })
      .on('mouseout', '.selectedRow > td', function(e) {
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
        //Total too wide? Add error class
          if(w > parseInt($('.selectedRow').closest('table').attr('width'))) {
            // w = 600;
            $('.tr-width').addClass('error')
          } else {
            $('.tr-width').removeClass('error')
          }

        //Set width of cell
          // I have forgotten why I did this width closest - closestDescendant :-o
          // $('td.selectedCell').closest('table')
            // .closestDescendant('td', true).eq($(this).attr('rel'))
            // .attr('width', newWidth)

          $('.selectedCell').attr('width', newWidth);

        //Resize images
          if($(that).find('img').length > 0) {
            $(that).find('img').attr('width', newWidth)
                        .attr('height', newWidth*parseInt($(this).attr('data-h'))/parseInt($(this).attr('data-w')));
          }

        $(that).siblings('.tr-width').text(w + ' / ' + $('.selectedRow').closest('table').attr('width'));
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
      .on('focus', '.td-set', function(e) {
        $('td.selectedCell').removeClass('selectedCell').parent()
          .children('td').eq($(this).attr('rel'))
          .addClass('selectedCell')
        selectCell = false;
      })
      .on('blur', '.td-set', function(e) {
        selectCell = true;
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
      if(showHelp === true) {
        alert("KAK");
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
    /* Opens the template in a new screen and opens the code in a new document to be copied. */
    function prepareCode() {
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
    }

    $('.js-generate').on('click', function(e) {
      e.preventDefault();

      prepareCode();

      var $html = $("#mailTemplate").clone();
      // var html = $("#mailTemplate").html();

      /* TODO

      remove
      - id
      - data-id
      - data-w
      - data-h
      - data-type
      - .field
      - .ui-resizable
      - .tekstitem
      - #placeholder

      */

      $html.find('*[data-id]').removeAttr('data-id');
      $html.find('*[data-w]').removeAttr('data-w');
      $html.find('*[data-h]').removeAttr('data-h');
      $html.find('*[data-type]').removeAttr('data-type');
      $html.find('.field').removeClass('field');
      $html.find('.ui-resizable').removeClass('ui-resizable');
      $html.find('.tekstitem').removeClass('tekstitem');
      $html.find('.connectedSortable').removeClass('connectedSortable');
      $html.find('.ui-sortable').removeClass('ui-sortable');
      $html.find('.selectedRow').removeClass('selectedRow');


      var html = $html.html();


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

      //Add css
      $('#mailTemplate .base-css').html($('#base-css').html());

      //Add code
      $('#mailTemplate #placeholder').html($code);
      var html = $("#mailTemplate").html();
      html = html.replace(/\[\{/g, '<');
      html = html.replace(/\}\]/g, '>');

      html
      // console.log(html);

      var newIframe = document.createElement('iframe');
      newIframe.width = '320';
      newIframe.height = '480';
      // newIframe.src = 'about:blank';
      document.getElementById('mobile').appendChild(newIframe);
      // console.log(newIframe);
      // newIframe.contentWindow.document.open('text/htmlreplace');
      // newIframe.contentWindow.document.write(html);
      // newIframe.contentWindow.document.close();

      newIframe.srcdoc = html;

      $('#mobile').resizable({
        minWidth: 320,
        minHeight: 480,
      }).fadeIn();
    });

    $('.closeMobile').click(function() {
      $('#mobile').fadeOut();
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
        //
        console.log($('#insertedTemplateHTML').children('table').length);
        if($('#insertedTemplateHTML').children('table').length === 1) {
          $('#insertedTemplateHTML').children('table').removeClass('deviceWidth').find('table:first').addClass('deviceWidth').siblings().addClass('deviceWidth');
        }
        html = $('#insertedTemplateHTML').find('.deviceWidth:first').parent().html();
      }

      //Add css
      $('#base-css').text($('#insertedTemplateHTML').children('style').text());

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

  //Edit template code
    var cm;
    $('.js-edit-code').click(function() {
      if($('.template.selected').length > 0) {

        $('#editTemplate textarea').val($('.template.selected').html());

        cm = CodeMirror.fromTextArea(document.getElementById('editingTemplate'), {
          lineNumbers: false,
          mode: { name: "htmlmixed"},
          tabSize: 1,
          lineWrapping: true,
          theme: "zenburn",
          styleActiveLine: true,
          matchBrackets: true,
        });

        $('#editTemplate').toggleClass('show');

        if(!$('#editTemplate').hasClass('show')) {
          cm.toTextArea();
          $('.CodeMirror').remove();
        }
      }
    });

    $('.js-insert-edited').click(function() {
      $('#editTemplate').toggleClass('show');
      cm.save();
      cm.toTextArea();

      if(!editingCSS) {
        $('.template.selected').html($('#editTemplate textarea').val());
      } else {
        editingCSS = false;
        $('#base-css').html($('#editTemplate textarea').val());
      }
      // $('.CodeMirror').remove();
    });

    $('#editTemplate div.textarea code')
      .focus(function() {
        selectCell = false;
      })
      .blur(function() {
        selectCell = true;
      })


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


  //Save
    $('.js-save').click(function(e) {
      e.preventDefault();
      e.stopPropagation();

      var code = $('.center td.mailing').html();

      $.ajax({
        type: "POST",
        url: "save.php",
        data: {
          'date': Date.now(),
          'html': code
        },
        success: function(response) {
          // console.log(response);
        }
      });
    });

  //Load
    $('.js-load').click(function(e) {
      e.preventDefault();
      e.stopPropagation();

      if($('#templateLibrary .saved').length === 0) {
        $.getJSON('list.php', function(data) {
          window.list = {};
          for(key in data) {
            var date = key.split('.')[0];
            date = new Date(1000*date);
            date = date.toLocaleDateString();
            // console.log(date);
            if(list[date] === undefined) {
              list[date] = [];
            }
            list[date].push(data[key]);
            // console.log(date.toDateString());
          }

          for(key in list) {
            $('#templateLibrary').append('<div class="templateRow" data-date="' + key + '"><span class="date">' + key + '</span></div>');

              list[key].forEach(function(item) {
                $('.templateRow[data-date="' + key + '"]').append('<div class="saved">' + item + '</div>');
              });

          }

          $('#templateLibrary').fadeToggle();
        });
      } else {
        $('#templateLibrary').fadeToggle();
      }
    });

    $('#templateLibrary').on('click', '.saved', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('.center .mailing').html($(this).html());
      $('.center .mailing').find('p, span, h1, h2, h3, h4, h5, h6, h7, blockquote').closest('td').each(function() {
        $(this).addClass("field").attr('data-type', 'text').attr('data-id', Math.floor(Math.random()*1000));
      });
      $('.center .mailing').find('img').closest('td').each(function() {
        $(this).addClass("field").attr('data-type', 'image').attr('data-id', Math.floor(Math.random()*1000));
      });

      //Add slices to templates
      $('.center .mailing').find('.template').each(function() {
        $(this).clone().appendTo('.templates');
      });

      $('#templateLibrary').fadeOut();
    });

  //History palette resizable
    $('#history').resizable({
      handles: "n"
    });

  setInterval(function() {
    var tmp = $('.app .mailing').html();
    var local = localStorage.getItem('MFMsaves');

    if(saves[saves.length-1] === tmp) {
      console.log("No changes");
    } else {
      saves.push(tmp);
      console.log("Saved");

      var id = Math.floor(Math.random(1000)*10000);
      // console.log(id);
      $('<canvas width="600" height="800" id="c' + id + '"></canvas>').appendTo($("#history"));
      html = document.getElementById("createTemplate").innerHTML;
      // console.log(html);
      rasterizeHTML.drawHTML(html, document.getElementById("c" + id));
    }

  }, 10000);

  //Edit CSS
    $('.js-edit-css').click(function() {
      editingCSS = true;

      $('#editTemplate textarea').val($('#base-css').html());

      cm = CodeMirror.fromTextArea(document.getElementById('editingTemplate'), {
        lineNumbers: false,
        mode: { name: "css"},
        tabSize: 1,
        lineWrapping: true,
        theme: "zenburn",
        styleActiveLine: true,
        matchBrackets: true,
      });

      $('#editTemplate').toggleClass('show');

      if(!$('#editTemplate').hasClass('show')) {
        cm.toTextArea();
        $('.CodeMirror').remove();
      }
    });

})(jQuery);