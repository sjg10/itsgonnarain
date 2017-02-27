from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from django.urls import reverse,get_script_prefix
from django.conf import settings
import tempfile
from sets import Set

from sound import create_track
from .. import views

class BasicBrowserTestCase(StaticLiveServerTestCase):
    """
    Test some basic broswer cases
    """
    def setUp(self):
        """
        Create a directory for media files
        and begin the browser
        """
        self.tempdir = tempfile.mkdtemp()
        settings.MEDIA_ROOT = self.tempdir
        self.selenium = webdriver.Firefox()
        super(BasicBrowserTestCase, self).setUp()

    def tearDown(self):
        """
        Call tearDown to close the web browser
        """
        self.selenium.quit()
        super(BasicBrowserTestCase, self).tearDown()

    def test_basic_load(self):
        """
        Test that a one track populates select and the fields
        correctly, and can play on click
        """
        # Create a track
        trackName = "testTrack"
        startTime = 0
        endTime = 5
        ratio = 2
        create_track(trackName, 0, 5, 2, self.tempdir + "/one.wav");
        # Get the page
        self.selenium.get(
            '%s%s' % (self.live_server_url, reverse('itsgonnarain:index'))
        )
        # Get the select list and check it has the correct entries
        sel = self.selenium.find_element_by_id("selTrack")
        self.assertEqual(Set(map(lambda x : x.text,
            sel.find_elements_by_tag_name('option'))), Set([trackName, "Upload..."]))
        # Check the fields have been populated with the database entries
        self.assertEqual(self.selenium.find_element_by_id("txtStart").get_property('value'), '%.2f' % (startTime))
        self.assertEqual(self.selenium.find_element_by_id("txtEnd").get_property('value'), '%.2f' % (endTime))
        self.assertEqual(self.selenium.find_element_by_id("txtRatio").get_property('value'), '%.3f' % (ratio))
        # Check we can;t play yet, but can load
        self.assertFalse(self.selenium.find_element_by_id("btnPlay").is_enabled())
        self.assertFalse(self.selenium.find_element_by_id("btnStop").is_enabled())
        self.assertTrue(self.selenium.find_element_by_id("btnLoad").is_enabled())
        self.selenium.find_element_by_id("btnLoad").click()
        # Check we can now play!
        #TODO: use WebDriverWait to wait for loaded and check play!
        # And then stop!

