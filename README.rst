django-pagelets
===============

Simple, flexible app for integrating static, unstructured content in a Django site

Features
========
  - "Pagelets" for adding small pieces of content to otherwise static templates
  - CMS "pages" which include any number of pagelets and, if needed, attachments
  - Different pagelet content types including HTML and Markdown
  - An integrated WYSIWYG editor (`WYMeditor
    <http://www.wymeditor.org/>`_) which can be selectively enabled/disabled

Dependencies
============
Required
--------
- Django admin site
  - The `django.core.context_processors.request` context processor

Optional
--------
 - `jQuery 1.3
   <http://jquery.com>`_
 - `WYMeditor
   <http://www.wymeditor.org/>`_ (included in pagelets media)
 - `CKEditor
   <http://www.ckeditor.org/>`_ (download from site)
 
Example
=======

django-pagelets includes a sample project to use as an example setup. You can run the sample project like so::

    ~$ mkvirtualenv --distribute pagelet-test
    (pagelet-test)~$ pip install -U django
    (pagelet-test)~$ git clone git://github.com/caktus/django-pagelets.git
    (pagelet-test)~$ cd django-pagelets/
    (pagelet-test)~/django-pagelets$ python setup.py develop
    (pagelet-test)~/django-pagelets$ cd sample_project/
    (pagelet-test)~/django-pagelets/sample_project$ ./manage.py syncdb
    (pagelet-test)~/django-pagelets/sample_project$ ./manage.py runserver

Installation and Setup
======================

1) django-pagelets is available on `PyPI <http://pypi.python.org/pypi/django-pagelets>`_, so the easiest way to install it is to use `pip <http://pip.openplans.org/>`_::

    pip install django-pagelets

2) Add `pagelets` to INSTALLED_APPS in settings.py and run syncdb::

        INSTALLED_APPS = (
            ...,
            'pagelets',
            ...
        )

3) Add `django.core.context_processors.request` to TEMPLATE_CONTEXT_PROCESSORS::

    TEMPLATE_CONTEXT_PROCESSORS = (
        "django.contrib.auth.context_processors.auth",
        "django.core.context_processors.debug",
        "django.core.context_processors.i18n",
        "django.core.context_processors.media",
        "django.contrib.messages.context_processors.messages",
        "django.core.context_processors.request", # <----
    )

4) Add the pagelets URLs to urls.py, e.g.::

    urlpatterns += patterns('',
        (r'^pagelets-management/', include('pagelets.urls.management')),
        (r'^', include('pagelets.urls.content')),
    )

5) In development, you can serve pagelet's static media in urls.py::

    import pagelets
    path = os.path.join(os.path.dirname(pagelets.__file__), 'media')

    urlpatterns += patterns('',
        (
            r'^%spagelets/(?P<path>.*)' % settings.MEDIA_URL.lstrip('/'),
            'django.views.static.serve',
            {'document_root': path, 'show_indexes': True}
        ),
    )

6) Visit the admin site, add and save a new page, and click the View on site link.  If everything is setup correctly, you should be able to see and edit the content you just added.

Optional Additional Setup
=========================

If you are using the `contrib.sitemaps` application to generate your sitemap you can make use of the `PageSiteMap`, e.g.::

    from django.conf.urls.defaults import *
    from pagelets.sitemaps import PageSiteMap

    sitemaps = {
        'pagelets': PageSiteMap(priority=0.6),
        # Your other sitemaps
        # ...
    }

    # Site url patterns would go here
    # ...

    urlpatterns += patterns('',

        # the sitemap
        (r'^sitemap\.xml$', 'django.contrib.sitemaps.views.sitemap', {'sitemaps': sitemaps}),
    )

Using CKEditor
==============

1) If you wish to use CKEditor with this plug-in, you can define a PAGELET_CONTENT_TYPES within your settings.py file:

PAGELET_CONTENT_TYPES = (
    ('html', 'HTML'),
    ('wymeditor', 'WYMeditor'),
    ('ckeditor', 'CKEditor'),
    ('textile', 'Textile')
    )

2) You'll need to install CKEditor into your MEDIA_URL dir inside the 'ckeditor/' directory.  The CKEditor
package should include the ckeditor/ckeditor.js and ckeditor/adapters/jquery.js.

3) If you're also using the Django grappelli/filebrowser app, then you also need to setup and install django-grappelli
and django-filebrowser too.  For using grappelli/filebrowser, there are a few additional configuration tweaks that 
must be done, including setting your ADMIN_MEDIA_PREFIX and installing any other dependencies.

4)  The wymeditor/js/pagelets.js has the following instantiation:


    if (value.toLowerCase() == 'ckeditor') {
        // NOTE: If the django-filebrowser app is not used, then remove the filebrowserBrowseUrl.
        // Using ckeditor() to replace a textarea does not call ckeditor/config.js, so we must
        // specify the config explicitly.
        content_field.ckeditor(function() { }, {width: '100%', 
                                                filebrowserBrowseUrl: '/admin/filebrowser/browse?pop=3'
                                               });
    }

If you're not going to use the Django filebrowser/grappelli plug-ins, remove the filebrowserBrowseUrl
definition.   See http://docs.cksource.com/CKEditor_3.x/Developers_Guide/File_Browser_(Uploader) for
more information.

5) You'll also need to modify the forms.py to include js_wym_ckeditor too:

        js_wymeditor = ('wymeditor/jquery.wymeditor.js',
              'wymeditor/plugins/embed/jquery.wymeditor.embed.js'  # fixes YouTube embed issues
              'js/pagelets.js') 

        js_wym_ckeditor = (
        # We assume CKEditor and filebrowser Django app are in these locations
                'ckeditor/ckeditor.js',
                'filebrowser/js/FB_CKEditor.js',
                'ckeditor/adapters/jquery.js')

        
        js = js_wymeditor + js_wym_ckeditor + ('js/pagelets.js',)

Extending and Customizing Pagelets
==================================

Auto template tag loading
-------------------------

To automatically load a custom template tag on every pagelet, add a
``PAGELET_TEMPLATE_TAGS`` list to settings.py::

    PAGELET_TEMPLATE_TAGS = (
        'myapp_tags',
        'myotherapp_tags',
    )

Custom base templates and content areas
---------------------------------------

By default, django-pagelets uses a simplified setup for rendering pages in a
uniform way. However, pages can be modified to extend from different base
templates for greater customization. Pagelets can also specify custom content
areas to allow for special grouping and positioning within pages.

Base templates and content areas can be customized via 2 settings:
PAGELET_BASE_TEMPLATES and PAGELET_CONTENT_AREAS. For example, if you'd like
to add an alternative 2-column layout, you could define the settings like so::

    PAGELET_BASE_TEMPLATES = (
        ('pagelets/two_column_page.html', 'Two Column'),
    )

    PAGELET_CONTENT_AREAS = (
        ('main', 'Main'),
        ('sidebar', 'Sidebar'),
    )

The page admin will now include an additional form field to select a base
template and pagelets will allow the specification of content areas. The `Two
Column` template could look something like this::

    {% extends "base.html" %}

    {% load pagelet_tags %}

    {% block title %}{{ page.title }}{% endblock %}

    {% block content %}
        <div id="main-panel">
            {% render_content_area page 'main' %}
        </div>
        <div id="sidebar-panel">
            {% render_content_area page 'sidebar' %}
        </div>
    {% endblock %}

Note the ``render_content_area`` template tags with ``main`` and ``sidebar``
specified.

Development sponsored by `Caktus Consulting Group, LLC.
<http://www.caktusgroup.com/services>`_.
