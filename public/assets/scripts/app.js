var Func = {
  appendArticles: (data) => {
    var $allarticles = $('<div>');
    var $savedarticles = $('<div>');
    for (var i = 0; i < data.length; i++) {
      var $saved = data[i].saved;
      var $panel = $('<div>').addClass('panel panel-info');
      var $header = $('<div>').addClass('panel-heading');
      var $h4 = $('<h4>');
      var $a = $('<a>').attr({'href': data[i].link, 'target': '_blank'}).text(data[i].title);
      $h4.append($a);
      $header.append($h4);
      var $body = $('<div>').addClass('panel-body');
      var $img = $('<img>').addClass('pull-left img-responsive')
        .attr('src', data[i].image);
      var $span = $('<span>').addClass('dtime text-warning').text(data[i].dt);
      var $more = $('<a>').attr({'href': data[i].link, 'target': '_blank'}).text('More');
      var $p = $('<p>').addClass('lead text-justify').text(data[i].brief).append($more);
      $body.append($img, $span, $p);
      var $footer = $('<div>').addClass('panel-footer');
      var $id = data[i]._id;
      var $idspan = $('<span>').text(`Article ID: ${$id}`).addClass('articleid');
      var $btnsave = $('<button>').addClass('savebtn btn btn-success' + ($saved ? ' hide' : ''))
        .attr({'type':'button', 'data-id': $id}).text('SAVE ARTICLE')
        .click(Func.saveFunc);
      var $btnnote = $('<button>').addClass('notebtn btn btn-info' + ($saved ? '' : ' hide'))
        .attr({'type':'button', 'data-id': $id,
         'data-title': data[i].brief.substring(0, 30)+'...',
         'data-toggle': 'modal', 'data-target': '#noteModal'})
        .text('Article Notes').click(Func.noteFunc);
      var $btndelete = $('<button>').addClass('deletebtn btn btn-danger' + ($saved ? '' : ' hide'))
        .attr({'type':'button', 'data-id': $id}).text('Dlete From Saved')
        .click(Func.deleteFunc);
      $footer.append($idspan, $btnsave, $btnnote, $btndelete)

      $panel.append($header, $body, $footer);
      if ($saved){
        $($savedarticles).append($panel);
      } else {
        $($allarticles).append($panel);
      };
    }
    if ($allarticles.children().length > 0){
      $('#noarticle').addClass('hide');
      $('#allarticles').removeClass('hide');
      $("#allarticles").html($allarticles);
    } else {
      $("#allarticles").empty();
      $('#noarticle').removeClass('hide');
      $('#allarticles').addClass('hide');
    };
    if ($savedarticles.children().length > 0){
      $('#nosavedarticle').addClass('hide');
      $('#savedarticles').removeClass('hide');
      $("#savedarticles").html($savedarticles);
    } else {
      $("#savedarticles").empty();
      $('#nosavedarticle').removeClass('hide');
      $('#savedarticles').addClass('hide');
    };
    $('#articleno').text($allarticles.children().length);
    $('#savedno').text($savedarticles.children().length);
  },

  saveFunc: (e) => {
    e.preventDefault();
    $thisID = $(e.target).data('id');
    console.log($thisID);
    $.post(`/articles/save/${$thisID}`, (data) => {
      if ( data ){
        Func.appendArticles(data);
      };
    });      
  },

  deleteFunc: (e) => {
    e.preventDefault();
    $thisID = $(e.target).data('id');
    console.log($thisID);
    $.post(`/articles/delete/${$thisID}`, (data) => {
      if ( data ){
        Func.appendArticles(data);
      };
    });      
  },

  scrape: () => {
    $.get("/scrape", (data) => {
      if ( data === 'completed'){
        $('#scrapebtn').attr('disabled', true);
        $('#scrapemodal').modal('show');
      };
    });  
  },

  getAllArticles: () => {
    $.getJSON("/articles", (data) => {
      if ( data ) {
        Func.appendArticles(data);
      }
    });
  },

  appendNotes: (id) => {
    $.get(`/articles/notes/${id}`, (data) => {
      var $notes = data.note;
      if ($notes.length > 0){
        for ( i = 0 ; i < $notes.length ; i++ ){
          var newNote = Func.noteRow($notes[i]);
          $('#notes').append(newNote);
        }
      } else {
        $('#notes').text('No Notes for this article yet !')
      };
    });
  },

  noteRow: (data) => {
    var $panel = $('<div>').addClass('panel panel-primary');
    var $header = $('<div>').addClass('panel-heading');
    var $name = $("<font>").addClass('note-name');
    $name.append($("<span>").addClass('fa fa-user'));
    $name.append($("<span>").text(data.name));
    var $date = $("<font>").addClass('note-date');
    $date.append($("<span>").addClass('fa fa-calendar'));
    var utcdate = new Date(data.date);
    $date.append($("<span>").text(utcdate.toString()));
    var $delbtn = $('<a>').addClass('pull-right del-note')
      .attr({'data-noteid': data._id, 'title': 'Delete Note'});
    $delbtn.append($("<span>").addClass('fa fa-2x fa-remove text-danger'));
    $header.append($name, $date, $delbtn);
    var $body = $('<div>').addClass('panel-body').text(data.note);
    $panel.append($header, $body);
    return $panel;
  },

  saveNote: (id, postdata) => {
    $.post(`/articles/notes/${id}`, postdata, (data) => {
      if (data){
        Func.appendNotes(data);
      } else {
        $('#notes').text('No Notes for this article yet!')
      };
    });
  },

  clearModal: () => {
    $('#notes').empty();
    $('#errmsg').addClass('hide');
    $('#name').val(''),
    $('#note').val('');
  }
};

$(() => {
  Func.getAllArticles();
});

$('#scrapebtn').click( (e) => {
  e.preventDefault();
  Func.scrape();
});

$('#scrapemodal').on('hide.bs.modal', () => {
  Func.getAllArticles();
})

$('#noteModal').on('show.bs.modal', function (e) {
  var $thisID = $(e.relatedTarget).data('id');
  var $thisTitle = $(e.relatedTarget).data('title');
  $('#noteModalLabel').text(`Notes For Article: ${$thisID}`);
  $('#noteModalTitle').text($thisTitle);
  $('#notes').empty();
  $('#savenote').attr('data-id', $thisID);
  Func.appendNotes($thisID);
});

$('#noteModal').on('hidden.bs.modal', function (e) {
  Func.clearModal();
});

$('#savenote').click(function(e){
  e.preventDefault();
  var $thisID = $(e.target).data('id'),
      $name = $('#name').val(),
      $note = $('#note').val();
  if ( $name && $note ){
    Func.clearModal();
    var data = {
      name : $name,
      note : $note
    }
    Func.saveNote($thisID, data);
  } else {
    $('#errmsg').removeClass('hide');
  };
});
