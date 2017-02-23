==============
Its Gonna Rain
==============

itsgonnarain is a Django app that manages music content and a JS
application for mixing it like in Steve Reich's itsgonnarain.

For more info see https://teropa.info/blog/2016/07/28/javascript-systems-music.html

Detailed documentation is in the "docs" directory.

Quick start
-----------

1. Add "itsgonnarain" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'itsgonnarain',
    ]

2. Include the polls URLconf in your project urls.py like this::

    url(r'^itsgonnarain/', include('itsgonnarain.urls')),

3. Run `python manage.py migrate` to create the itsgonnarain models.

4. Start the development server and visit http://127.0.0.1:8000/admin/
   to add music (you'll need the Admin app enabled).

5. Visit http://127.0.0.1:8000/itsgonnarain/ to run.

Tasks
-----

- Add a way of user programmable ratio/time loop
- Play full audio clip before loop
- Move audio clips to DB and have a selection of them
- Allow user to upload a temporary clip for themselves
- Pretty-ify
