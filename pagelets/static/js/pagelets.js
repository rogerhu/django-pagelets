function disableCKEditor(textarea) {
    // We cannot use getEditor() since it will throw an exception.
    // http://ckeditor.com/blog/CKEditor_for_jQuery
    var ck = textarea.eq(0).data('ckeditorInstance');
    if (ck) {
        ck.destroy();
        ck = false;
    }
}

function setEditor(popup) {
    var value = popup.find('>:selected').val();
    var parent_form = popup.parents('form');
    var content_field_name = popup.attr('name').replace(/type$/, 'content');
    var content_field = parent_form.find('textarea[name=' + content_field_name + ']');

    disableCKEditor(content_field);

    if (value.toLowerCase() == 'wymeditor') {
        var overlay = $('<div>').addClass('file-picker-overlay').overlay({
            effect: 'apple',
            speed: 'fast'
        }).filePicker({
            url: "/file-picker/images/",
            onImageClick: function(e, insert) {
                this.getRoot().parent().data('wym').insert(insert);
            }
        }).insertBefore(content_field);
        content_field.wymeditor({
            updateSelector: 'input:submit',
            updateEvent: 'click',
            stylesheet: '/media/css/wymeditor_classes.css',
            classesItems: [
                {'name': 'left', 'title': 'Align Image Left', 
                'expr': 'img[class!=right]'},
                {'name': 'right', 'title': 'Align Image Right', 
                'expr': 'img[class!=left]'}
            ],
            postInit: function(wym) {
                image_button = jQuery(wym._box).find('li.wym_tools_image a');
                image_button.unbind();
                image_button.click(function(e) {
                    e.preventDefault();
                    $(overlay).data('wym', wym);
                    $(overlay).data('overlay').load();
                });
            }
        });
    } 
    // This else() must be used to remove WymEditor instances.
    else {
        jQuery.each(WYMeditor.INSTANCES, function() {
          if(this._element.attr('name') == content_field.attr('name')){
              this.update();
              $(this._box).remove();
              $(this._element).show();
              $(this._options.updateSelector).unbind(this._options.updateEvent);
              delete this;
          }
        });
        content_field.siblings('div.wym_box').remove();
        content_field.css('display', 'inline');
    }

    if (value.toLowerCase() == 'ckeditor') {
        // NOTE: If the django-filebrowser app is not used, then remove the filebrowserBrowseUrl.
        // Using ckeditor() to replace a textarea does not call ckeditor/config.js, so we must
        // specify the config explicitly.
        content_field.ckeditor(function() { }, {width: '100%', 
                                                filebrowserBrowseUrl: '/admin/filebrowser/browse?pop=3'
                                               });
    }

}

jQuery(function() {
    function install_editor(popup) {
        var empty_form = $(popup).parents('div.empty-form');
        if (empty_form.length == 0) {
            setEditor($(popup));
        }
    }
    $('select[name$=type]').live('change', function() {
        install_editor($(this));
    }).each(function (i) {
        install_editor($(this));
    });
});
