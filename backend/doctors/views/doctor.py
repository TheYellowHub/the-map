"""
Doctor model related APIs
"""

from rest_framework import generics
from django_filters import rest_framework as filters

from ..models.doctor import Doctor
from ..serializers.doctor import DoctorBasicSerializer, DoctorExtendedSerializer


class DoctorFilter(filters.FilterSet):
    """
    Filter options for DoctorListView
    """

    full_name = filters.CharFilter(field_name="full_name", lookup_expr="icontains")
    status = filters.CharFilter(lookup_expr="iexact")

    class Meta:
        model = Doctor
        fields = (
            "status",
            "categories",
            "specialities",
        )


class DoctorListView(generics.ListAPIView):
    """
    Get list of doctors with thies basic info, matching the search criteria.
    Usage:
        /api/doctors/doctor/list
        /api/doctors/doctor/list?categories=1&categories=2&specialities=1&status=1
        /api/doctors/doctor/list?full_name=jesi
        /api/doctors/doctor/list?&status_name=pending_approval
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorBasicSerializer
    filterset_class = DoctorFilter


class DoctorInfoView(generics.RetrieveAPIView):
    """
    Get full information about a doctor.
    Usage: /api/doctors/doctor/<pk>
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorExtendedSerializer


class DoctorUpdateView(generics.UpdateAPIView):
    """
    Update a doctor basic info.
    Usage: /api/doctors/doctor/<pk>/update
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorBasicSerializer


class DoctorCreateView(generics.CreateAPIView):
    """
    Add a doctor.
    Usage: /api/doctors/doctor/create
    """

    queryset = Doctor.objects.all()
    serializer_class = DoctorBasicSerializer
