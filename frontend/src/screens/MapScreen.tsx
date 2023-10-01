import { ReactNode, useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";

import { Doctor, doctorDistanceFromLocation } from "../types/doctors/doctor";
import { DoctorCategory } from "../types/doctors/doctorCategory";
import { DoctorSpeciality } from "../types/doctors/DoctorSpeciality";
import useDoctors from "../hooks/doctors/useDoctors";
import useDoctorCategories from "../hooks/doctors/useDoctorCategories";
import useDoctorSpecialities from "../hooks/doctors/useDoctorSpecialities";
import DoctorSmallCard from "../components/doctors/doctors/DoctorSmallCard";
import DoctorBigCard from "../components/doctors/doctors/DoctorBigCard";
import CheckboxesGroupFormField from "../components/utils/form/checkboxesGroupField";
import Pagination from "../components/utils/Pagination";
import LoadingWrapper from "../components/utils/LoadingWrapper";
import { ResponseError } from "../utils/request";
import GoogleMap from "../components/map/GoogleMap";
import useGoogleMaps, { Location } from "../utils/googleMaps/useGoogleMaps";
import AddressInputFormField from "../components/utils/form/addressField";
import ComboboxFormField from "../components/utils/form/comboboxField";
import Message from "../components/utils/Message";
import Button from "../components/utils/Button";

function MapScreen() {
    const { setCurrentLocation, getAddress, getLocation, getDistance, isLoaded: isGoogleMapsLoaded } = useGoogleMaps();

    const { data: doctors, isListLoading, isListError, listError } = useDoctors();
    const { data: categories } = useDoctorCategories();
    const { data: specialities } = useDoctorSpecialities();

    const [matchedDoctors, setMatchedDoctors] = useState<Doctor[]>([]);
    const [doctorsInPage, setDoctorsInPage] = useState<Doctor[]>([]);
    const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
    const [previousDoctor, setPreviousDoctor] = useState<Doctor | null>(null);

    const [location, setLocation] = useState<Location | undefined>();
    const [address, setAddress] = useState("");
    const [distance, setDistance] = useState<number | undefined>(50);
    const distanceUnit = location?.country === "US" ? "Mile" : "KM";

    const [nameIncludes, setNameIncluds] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
    const [specialitiesFilter, setSpecialitiesFilter] = useState<string[]>([]);

    const [sortKey, setSortKey] = useState<string>("Name");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10); // TODO: initial value according to the view, i.e. how many doctors fit in?

    // TODO: change the URL
    const addAdoctorLink = (reactNode: ReactNode) => (
        <a href="#/doctors/add" target="_blank" rel="noreferrer">
            {reactNode}
        </a>
    );

    const sortOptions: Map<string, (a: Doctor, b: Doctor) => number> = new Map([
        [
            "Name",
            (a, b) => {
                return a.fullName < b.fullName ? 1 : a.fullName > b.fullName ? -1 : 0;
            },
        ],
        [
            "ID",
            (a, b) => {
                return (a.id === undefined ? 0 : a.id) - (b.id === undefined ? 0 : b.id);
            },
        ],
        [
            "Distance",
            (a, b) => {
                if (location === undefined) {
                    return 0;
                } else {
                    const distanceA = doctorDistanceFromLocation(a, location, distanceUnit);
                    const distanceB = doctorDistanceFromLocation(b, location, distanceUnit);
                    return distanceA < distanceB ? -1 : distanceB < distanceA ? 1 : 0;
                }
            },
        ],
    ]);

    useEffect(() => {
        setCurrentLocation((location: Location) => {
            setLocation(location);
            getAddress(location).then((address) => {
                if (address !== undefined) {
                    setAddress(address);
                }
            });
        });
    }, [isGoogleMapsLoaded]);

    useEffect(() => {
        setMatchedDoctors(() =>
            doctors
                .filter((doctor: Doctor) => {
                    const doctorDistance =
                        distance === undefined || location === undefined
                            ? undefined
                            : doctorDistanceFromLocation(doctor, location, distanceUnit);
                    return (
                        doctor.status === "APPROVED" &&
                        doctor.fullName?.toLowerCase().includes(nameIncludes.toLowerCase()) &&
                        (categoryFilter === undefined || categoryFilter === doctor.category) &&
                        specialitiesFilter.every((speciality) => doctor.specialities.includes(speciality)) &&
                        (distance === undefined ||
                            location === undefined ||
                            (doctorDistance && doctorDistance <= distance))
                    );
                })
                .sort(sortOptions.get(sortKey))
        );
    }, [doctors, location, distance, nameIncludes, categoryFilter, specialitiesFilter, sortKey]);

    useEffect(() => {
        setDoctorsInPage(() => matchedDoctors.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize));
    }, [matchedDoctors, pageIndex, pageSize]);

    return (
        <LoadingWrapper isLoading={isListLoading} isError={isListError} error={listError as ResponseError}>
            <Container fluid>
                <Row>
                    <Col>
                        <Row className="border p-2 m-2">
                            <Form>
                                <Form.Group as={Row}>
                                    <Form.Label column htmlFor="address">
                                        Address
                                    </Form.Label>
                                    <Col sm={9}>
                                        <AddressInputFormField<undefined>
                                            field={{
                                                type: "address",
                                                label: "address",
                                                getter: () => {
                                                    return address;
                                                },
                                                setter: (_: undefined, newAddress: string) => {
                                                    setAddress(newAddress);
                                                    getLocation(newAddress).then((location) => setLocation(location));
                                                    return undefined;
                                                },
                                            }}
                                            object={undefined}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={3} htmlFor="distance">
                                        Distance
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            type="number"
                                            id="distance"
                                            value={distance}
                                            onChange={(e) =>
                                                setDistance(e.target.value ? Number(e.target.value) : undefined)
                                            }
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column htmlFor="name">
                                        Name
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            id="name"
                                            value={nameIncludes}
                                            onChange={(e) => setNameIncluds(e.target.value)}
                                            autoComplete="off"
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column>Category</Form.Label>
                                    <Col sm={9}>
                                        <ComboboxFormField
                                            field={{
                                                type: "combobox",
                                                label: "Category",
                                                getter: () => categoryFilter,
                                                setter: (_, newCategory: string | undefined) =>
                                                    setCategoryFilter(newCategory) as undefined,
                                                options: categories.map((category: DoctorCategory) => {
                                                    return { key: category.name, value: category.name };
                                                }),
                                            }}
                                            object={undefined}
                                            allowEmptySelection={true}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column>Specialities</Form.Label>
                                    <Col sm={9}>
                                        <CheckboxesGroupFormField
                                            field={{
                                                type: "checkboxesGroup",
                                                label: "Specialities",
                                                getter: () => specialitiesFilter,
                                                setter: (_, newSpecialities: string[]) =>
                                                    setSpecialitiesFilter(newSpecialities) as undefined,
                                                options: specialities.map((speciality: DoctorSpeciality) => {
                                                    return { key: speciality.name, value: speciality.name };
                                                }),
                                            }}
                                            object={undefined}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column htmlFor="sort-by-select">
                                        Sort by
                                    </Form.Label>
                                    <Col sm={9}>
                                        <select
                                            id="sort-by-select"
                                            className="form-select"
                                            value={sortKey}
                                            onChange={(e) => setSortKey(e.target.value)}
                                        >
                                            {Array.from(sortOptions.keys()).map((sortKey) => (
                                                <option value={sortKey} key={sortKey}>
                                                    {sortKey}
                                                </option>
                                            ))}
                                        </select>
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Row>
                        {matchedDoctors.length > 0 ? (
                            <>
                                <Row className="border p-2 m-2">
                                    <Container className="doctorSearchResult">
                                        {doctorsInPage.map((doctor: Doctor) => (
                                            <DoctorSmallCard
                                                key={doctor.id}
                                                doctor={doctor}
                                                locationForDistanceCalculation={location}
                                                distanceUnit={distanceUnit}
                                                onClick={() => {
                                                    setCurrentDoctor(doctor);
                                                }}
                                            />
                                        ))}
                                    </Container>
                                </Row>
                                <Row className="border p-2 m-2">
                                    <Pagination
                                        rowsCount={matchedDoctors.length}
                                        pageIndex={pageIndex}
                                        pageSize={pageSize}
                                        setPageIndex={setPageIndex}
                                        setPageSize={setPageSize}
                                    />
                                </Row>
                            </>
                        ) : (
                            <>
                                <Message variant="warning">
                                    No doctors were found. If you know such doctor, please
                                    {addAdoctorLink(<>let us know</>)}
                                </Message>
                            </>
                        )}
                    </Col>
                    <Col className="border p-2 m-2">
                        <Container className="map">
                            <GoogleMap<Doctor>
                                center={location}
                                markers={matchedDoctors
                                    .map((doctor) => {
                                        return {
                                            obj: doctor,
                                            title: doctor.fullName,
                                            icon: categories.filter(
                                                (category: DoctorCategory) => category.name === doctor.category
                                            )[0]?.icon,
                                            locations: doctor.locations
                                                .filter(
                                                    (doctorLocation) =>
                                                        doctorLocation.lat !== undefined &&
                                                        doctorLocation.lat !== null &&
                                                        doctorLocation.lng !== undefined &&
                                                        doctorLocation.lng !== null
                                                )
                                                .map((doctorLocation) => {
                                                    return {
                                                        lat: Number(doctorLocation.lat!),
                                                        lng: Number(doctorLocation.lng!),
                                                    };
                                                })
                                                .filter(
                                                    (doctorLocation) =>
                                                        distance === undefined ||
                                                        location === undefined ||
                                                        getDistance(location, doctorLocation) <= distance
                                                ),
                                            showInfoWindow: (doctor: Doctor) =>
                                                currentDoctor === doctor ||
                                                (currentDoctor === null && previousDoctor === doctor),
                                            onClosingInfoWindow: () => {
                                                setPreviousDoctor(currentDoctor);
                                                setCurrentDoctor(null);
                                            },
                                            onClick: () => {
                                                setCurrentDoctor(doctor);
                                            },
                                        };
                                    })
                                    .filter((markersGroup) => markersGroup.locations.length > 0)}
                            />
                            <div className="aboveMap">
                                {addAdoctorLink(<Button variant="success" label="Recommend a doctor"></Button>)}
                            </div>
                        </Container>
                    </Col>
                </Row>
            </Container>

            {currentDoctor !== null && (
                <DoctorBigCard
                    doctor={currentDoctor}
                    show={currentDoctor !== null}
                    onClose={() => {
                        setPreviousDoctor(currentDoctor);
                        setCurrentDoctor(null);
                    }}
                />
            )}
        </LoadingWrapper>
    );
}

export default MapScreen;
