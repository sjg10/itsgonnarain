==============
Its Gonna Rain
==============

itsgonnarain is a Django app that manages music content and a JS
application for mixing it like in Steve Reich's itsgonnarain.

For more info see https://teropa.info/blog/2016/07/28/javascript-systems-music.html

Detailed documentation is in the "docs" directory.

Quick start
-----------

#. Add "itsgonnarain" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'itsgonnarain',
    ]

#. Add a "MEDIA_URL" to your settings, and, optionally a "MEDIA_ROOT"
   where uploaded sound tracks will be placed. Ensure "MEDIA_ROOT" is served.
   E.g. in development in urls.py::

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#. Include the polls URLconf in your project urls.py like this::

    url(r'^itsgonnarain/', include('itsgonnarain.urls')),

#. Run `python manage.py migrate` to create the itsgonnarain models.

#. Start the development server and visit http://127.0.0.1:8000/admin/
   to add music (you'll need the Admin app enabled).

#. Visit http://127.0.0.1:8000/itsgonnarain/ to run.

Tasks
-----

- Add a way of user programmable ratio/time loop
- Play full audio clip before loop
- Move audio clips to DB and have a selection of them
- Allow user to upload a temporary clip for themselves
- Pretty-ify
