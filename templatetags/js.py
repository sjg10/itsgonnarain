from django.utils.safestring import mark_safe
from django.template import Library
from django.db import models

import json
from django.core import serializers


register = Library()


JSONSerializer = serializers.get_serializer("json")

class JSONWithURLSerializer(JSONSerializer):
    """
    Create serializer (converter of objects to json strings
    that returns url instead of value for FileFields
    """
    def handle_field(self, obj, field):
        value = field.value_from_object(obj)
        if isinstance(field, models.FileField) and hasattr(value, 'url'):
            self._current[field.name] = value.url
        else:
            return super(JSONWithURLSerializer, self).handle_field(obj, field)

@register.filter(is_safe=True)
def js_queryset(obj):
    """
    A template tag to apply to query sets to JSON-ise them
    """
    serializer = JSONWithURLSerializer()
    data = serializer.serialize(obj)
    return mark_safe(json.dumps(data))
