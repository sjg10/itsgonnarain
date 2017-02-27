from django.test import TestCase
from django.urls import reverse
from django.http import QueryDict

import datetime
from django.utils import timezone
from .. import models
from .. import forms
from django.conf import settings

import wave,struct,math, tempfile
from django.core.files import File

def create_wav(file_name, seconds):
    """
    Create a wav file at the given file_name (and path) playing middle C for a given number of seconds
    """
    HERTZ = 440
    RATE = 44100
    FRAMES = RATE * seconds
    OMEGA = (2*math.pi) / RATE
    VOLUME = 20000
    noise = wave.open(file_name,'w')
    noise.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'));
    values = ''.join([struct.pack('h', VOLUME * math.sin(i * OMEGA * HERTZ)) for i in range(0,(FRAMES))])
    noise.writeframes(values)
    noise.close()

def create_track(name, recommended_start_time, recommended_end_time, recommended_ratio, file_name, create_new_track = True):
    """
    Add a new track object to the Track model, a wav file will be created at file_name unless create_new_track is False, and
    a preexisting file will be assumed.
    file_name must be within MEDIA_ROOT.
    """
    if create_new_track:
        create_wav(file_name, 10)
    with open(file_name,'rb') as f:
        q = QueryDict(mutable=True)
        q['name'] = name
        q['recommended_start_time'] = recommended_start_time
        q['recommended_end_time'] = recommended_end_time
        q['recommended_ratio'] = recommended_ratio
        q['file_name'] = f
        t = forms.TrackForm(q)
        t.save()

class BasicTests(TestCase):
    def setUp(self):
        """
        Setup before basic tests to create a temp dir for uploaded wav files,
        and set MEDIA_ROOT to it to ensure they are within the project.
        """
        self.tempdir = tempfile.mkdtemp()
        settings.MEDIA_ROOT = self.tempdir

    def test_create_entry(self):
        """
        Basic test to see if we can create a new track object"
        """
        self.assertEqual(len(models.Track.objects.all()), 0)
        create_track("one", 0, 5, 2, self.tempdir + "/one.wav");
        self.assertEqual(len(models.Track.objects.all()), 1)

    def test_create_good_ratio(self):
        """
        Test to see if ratios are well verified
        """
        file_name = self.tempdir + "/one.wav"
        create_track("one", 0, 5, 2, file_name) # Definitely good
        create_track("two", 0, 5, 1, file_name, create_new_track = False); # Border case
        # Note validation creates ValidationErrors, but the save in create_track recasts them to ValueError
        with self.assertRaises(ValueError):
            create_track("three", 0, 5, 0.5, file_name, create_new_track = False); # False case
