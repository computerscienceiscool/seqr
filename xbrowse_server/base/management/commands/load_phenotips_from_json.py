from django.core.management.base import BaseCommand
from xbrowse_server.base.models import Project, Individual

import json
from pprint import pprint
import requests


def do_authenticated_call_to_phenotips(url, patient_data):
    """Do a POST call to phenotips"""

    return requests.put(url, data=json.dumps(patient_data), auth=("Admin", "admin"))



class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('project_id')
        parser.add_argument('json_file')

    def handle(self, *args, **options):
        project_id = options['project_id']
        json_file = options['json_file']

        project = Project.objects.get(project_id=project_id)

        for patient_json in json.load(open(json_file)):
            indiv_id = patient_json['external_id']
            indiv = Individual.objects.get(project=project, indiv_id=indiv_id)
            patient_json['external_id'] = indiv.phenotips_id

            print("Updating %s" % indiv.phenotips_id)

            response = do_authenticated_call_to_phenotips(
                "http://xbrowse-dev:9010/rest/patients/eid/"+patient_json['external_id'],
                patient_json)

            if response.status_code != 204:
                print("ERROR: " + str(response))



