var id;

// $('.center').resizable({
//   minWidth: 320
// });

// Drag templates to canvas area
$('.template').draggable({
  appendTo: "body",
  helper: "clone"
});

// Canvas area shoud accept templates, and make them sortable
$('.mailing')
  .droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.slice)",
    drop: function(event, ui) {
      $(this).find('.placeholder').remove();
      var sid = "slice" + Math.floor(Math.random()*1000);
      $('<div class="template slice" id="' + sid + '"></div>')
        .html(ui.draggable.html())
        .appendTo(this)
        .children('table')
        .resizable({
          resize: function(event, ui) {
            $(this).attr('height', ui.size.height);
          }
        })
        .find('img')
        .resizable({
          resize: function(event, ui) {
            $(this).attr('height', ui.size.height);
          }
        })
    }
  })
  .sortable({
    items: '.template',
    placeholder: "sortable-placeholder",
    forceHelperSize: true,
    opacity: 0.5
  })

// Clicking on a template should open the edit area
$('.mailing').on('click', '.template', function(e) {
  e.preventDefault();
  e.stopPropagation();
  $slice = $(this);
  id = $slice.attr('id');
  var bgcolor = $slice.children('table').attr('bgcolor');
  // var color = $slice.children('table').css('color');

  $('.right .editor').html('<form rel="' + id +'" action="upload.php" method="post" enctype="multipart/form-data"></form>')

  // Add color handle
    $('.right .editor form')
      .append('<div class="colors">Achtergrondkleur: <div type="text" class="bgcolor" value="' + bgcolor + '"></div></div>')
      // .append('<div class="colors">Tekstkleur: <div type="text" class="color" value="' + color + '"></div></div>')

    $('.bgcolor').minicolors({
      changeDelay: 100,
      change: function(hex, opacity) {
        // console.log(hex + ' - ' + opacity);
        $slice.children('table').attr('bgcolor', hex);
      }
    });
    // $('.color').minicolors({
    //   changeDelay: 100,
    //   change: function(hex, opacity) {
    //     // console.log(hex + ' - ' + opacity);
    //     $slice.children('table').css('color', hex);
    //   }
    // });
    // $('.color').minicolors('value', color);
    $('.bgcolor').minicolors('value', bgcolor);

  $(this).find('.field').each(function() {
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
      case "image":
        // openTag = 'input type="file"';
        // endTag = 'input';
        openTag = endTag = "textarea";
        content = '>' + $this.html();
        break;
      default:
        openTag = 'input type="text"';
        endTag = 'input';
        content = ' value="' + $this.text() + '">';
    }

    $('.right .editor form[rel]')
      .append('<div><label>' + $this.data('type') + '</label><' + openTag + ' id="' + $this.data('type') + id + delta + '" name="' + $this.data('type') + id + '" data-target="' + $this.data('label') + '"' + content + '</' + endTag + '></div>');

    if($this.data('type') === "textarea") {
      $('#textarea' + id + delta).redactor({
        focus: true,
        // imageUpload: 'upload.php',
        // imageManagerJson: 'images/images.json',
        plugins: ['fontcolor', 'fontfamily', 'fontsize'],
        linebreaks: false,
        // replaceDivs: true,
        // allowedTags: ['p', 'h1', 'h2', ,'h3', 'h4', 'strong', 'b', 'em', 'i', 'pre'],
        paragraphize: true,
        changeCallback: function()
        {
            $('#textarea' + id).val(this.code.get());
            $('.js-save').trigger('click');
        }
      });
    }

    if($this.data('type') === "image") {
      $('#image' + id + delta).redactor({
        focus: true,
        imageUpload: 'upload.php',
        // imageManagerJson: 'images/images.json',
        // plugins: ['imagemanager'],
        // linebreaks: true,
        buttons: ['image'],
        changeCallback: function()
        {
            // console.log(this);
            $('#image' + id).val(this.code.get());
            $('.js-save').trigger('click');
        }
      });
    }
    // if($this.data('type') === "file") {
    //   $('.right form').on('change', 'input[type="file"]', function(e) {
    //     console.log($form.serialize());

    //     $.ajax({
    //       url: 'upload.php',
    //       type: 'POST',
    //       data: $form.serialize(),
    //       cache: false,
    //       processData: false,
    //       success: function(data) {
    //         console.log(data);
    //       }
    //     });
    //   });
    // }
  });

  $('.right .editor form[rel]').append('<input type="submit" class="js-save" value="Opslaan"> <button class="js-delete">delete</button>');
});

$('.right').on('click', '.js-save', function(e) {
  e.preventDefault();
  var $form = $(this).closest('form');

  $form.find('input').each(function() {
    $('#' + id + ' .field[data-label="' + $(this).data('target') + '"]').html($(this).val());
  });

  $form.find('textarea').each(function() {
    $('#' + id + ' .field[data-label="' + $(this).data('target') + '"]').html($(this).redactor('code.get'));
  });

  // $('.right form').submit();

  // console.log($form.serialize());
  // console.log(new FormData($form[0]));
  //   var formObj = $(this);
  //   var formData = new FormData(this);
  //   console.log(formData);

  // var formObj = $('.right form');
  // var formData = new FormData(formObj[0]);
  // console.log(formData);

  // $.ajax({
  //   url: 'upload.php',
  //   type: 'POST',
  //   data: formData,
  //   mimeType: "multipart/form-data",
  //   cache: false,
  //   processData: false,
  //   success: function(data) {
  //     console.log(data);
  //   }
  // });

  //not this
    // $form.find('label').each(function() {
    //   $('#' + id + ' .field[data-label="' + $(this).text() + '"]').html($(this).next().val());
    // });
});

// $('.right form').submit(function(e) {
//     e.preventDefault();
//     var formObj = $(this);
//     var formData = new FormData(this);
//     console.log(formData);

//     $.ajax({
//       url: 'upload.php',
//       type: 'POST',
//       data: formData, //$form.serialize(),
//       mimeType: "multipart/form-data",
//   //     contentType: false,
//       cache: false,
//       processData: false,
//       success: function(data) {
//         console.log(data);
//       }
//     });

//     e.preventDefault();
//     return false;
// });

$('.right').on('keyup', 'input', function(e) {
  $('.js-save').trigger('click');
});

$('.right').append('<button class="js-generate">CODE</button>');

$('.right').on('click', '.js-delete', function(e) {
  e.preventDefault();
  e.stopPropagation();
  if(window.confirm("Weet u zeker?")) {
    $('.slice#' + id).remove();
    $('.editor').empty();
  }
});

function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

$('.js-generate').on('click', function(e) {
  e.preventDefault();
  $code = $('.center').clone();

  $code.find('.template').each(function() {
    $(this).children().unwrap();
  });

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