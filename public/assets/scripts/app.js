$('#scrapebtn').click(function(e){
  e.preventDefault();
  $.get("/scrape", function(data) {
    if ( data === 'completed'){
      $('#scrapebtn').attr('disabled', true);
      $('#scrapemodal').modal('show');
    };
  });  
});

$('#scrapemodal').on('hide.bs.modal', function () {
  $.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
      var $panel = $('<div>').addClass('panel panel-info');
      var $header = $('<div>').addClass('panel-heading');
      var $h4 = $('<h4>');
      var $a = $('<a>').attr('href', data[i].link).text(data[i].title);
      $h4.append($a);
      $header.append($h4);
      var $body = $('<div>').addClass('panel-body');
      var $img = $('<img>').addClass('pull-left img-responsive')
        .attr('src', data[i].image);
      var $p = $('<p>').addClass('lead text-justify').text(data[i].brief);
      $body.append($img, $p);
      var $footer = $('<div>').addClass('panel-footer');
      var $btn = $('<button>').addClass('savebtn btn btn-success')
        .attr({'type':'button', 'data-id': data[i]._id}).text('SAVE ARTICLE');
      $footer.append($btn)

      $panel.append($header, $body, $footer);
      $("#articles").append($panel);
    }
  });  
})