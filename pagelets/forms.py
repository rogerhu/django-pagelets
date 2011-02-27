from django import forms
from django.utils.translation import gettext_lazy as _

from pagelets.models import Pagelet, PageAttachment


class PageletForm(forms.ModelForm):

    class Meta:
        model = Pagelet
        fields = ('type', 'content')

    class Media:
        css = {
            'all': ('css/pagelets.css',)
        }
        js_wymeditor = ('wymeditor/jquery.wymeditor.js',
	      'wymeditor/plugins/embed/jquery.wymeditor.embed.js') # fixes YouTube embed issues

        # We assume CKEditor and filebrowser Django app are in these locations
	js_ckeditor = (
		'ckeditor/ckeditor.js',
                'filebrowser/js/FB_CKEditor.js',
                'ckeditor/adapters/jquery.js')

        # The js/pagelets.js file is what is used to trigger the on-change events for 
	# selecting the editors. 
	js = js_wymeditor + ('js/pagelets.js',)
#	js = js_wymeditor + js_ckeditor + ('js/pagelets.js',)

    def __init__(self, *args, **kwargs):
        self.preview = kwargs.pop('preview', False)
        super(PageletForm, self).__init__(*args, **kwargs)
        if self.preview:
            for field in self.fields.itervalues():
                field.widget = forms.HiddenInput()
        else:
            self.fields['content'].widget = forms.Textarea(
                attrs={'rows': 30, 'cols': 90}
            )

    def save(self, commit=True, user=None):
        instance = super(PageletForm, self).save(commit=False)
        if user:
            instance.created_by = user
            instance.modified_by = user
        else:
            raise ValueError(_(u'A user is required when saving a Pagelet'))
        if commit:
            instance.save()
        return instance


class UploadForm(forms.ModelForm):

    class Meta:
        model = PageAttachment
        fields = ('name', 'file', 'order')

    def save(self, page, commit=True):
        instance = super(UploadForm, self).save(commit=False)
        instance.page = page
        if commit:
            instance.save()
        return instance
