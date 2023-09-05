import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Container, Form, Table } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Swal from "sweetalert2";
import Alert from "react-bootstrap/Alert";

function HomeComp() {
  const [sortOrder, setSortOrder] = useState("asc");
  const [data, setData] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [createUser, setCreateUser] = useState({
    name: "",
    description: "",
  });
  const fetchData = async () => {
    await axios
      .get(`http://localhost:8000/api/v1/users`)
      .then((res) => {
        if (sortOrder === "asc") {
          let ascData = res.data.sort((a, b) => a.user_id - b.user_id);
          setData(ascData);
        } else {
          let descData = res.data.sort((a, b) => b.user_id - a.user_id);
          setData(descData);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchData();
  }, [sortOrder]);

  const handleSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    fetchData();
  };

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setIsValid(true);
  };
  const handleShow = () => setShow(true);

  const handleChangeCreateUser = (event) => {
    const { name, value } = event.target;
    setCreateUser((pre) => ({
      ...createUser,
      [name]: value,
    }));
  };

  const handleSubmitCreate = (event) => {
    event.preventDefault();
    if (
      createUser.name === "" ||
      createUser.description === "" ||
      createUser.name.length > 255 ||
      createUser.description.length > 255
    ) {
      setIsValid(false);
    } else {
      axios
        .post("http://localhost:8000/api/v1/users", createUser)
        .then((res) => {
          if (res.status === 201) {
            setShow(false);
            fetchData();
            Swal.fire({
              title: "Thêm thành công!",
              icon: "success",
              timer: 2000,
            });
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa student này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/v1/users/${userId}`)
          .then((res) => {
            if (res.status === 204) {
              Swal.fire({
                title: "Xóa thành công!",
                icon: "success",
                timer: 2000,
              });
              fetchData();
            }
          })
          .catch((error) => {
            Swal.fire("Lỗi khi xóa!", "", "error");
            console.error(error);
          });
      }
    });
  };

  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [updateUser, setUpdateUser] = useState({
    id: null,
    name: "",
    description: "",
  });

  const handleShowUpdateModal = (user) => {
    setUpdateUser({
      id: user.user_id,
      name: user.name,
      description: user.description,
    });
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateUser({
      id: null,
      name: "",
      description: "",
    });
    setShowUpdateModal(false);
    setIsValid(true);
  };

  const handleChangeUpdateUser = (event) => {
    const { name, value } = event.target;
    setUpdateUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = (event) => {
    event.preventDefault();
    if (
      updateUser.name === "" ||
      updateUser.description === "" ||
      updateUser.name.length > 255 ||
      updateUser.description.length > 255
    ) {
      setIsValid(false);
    } else {
      axios
        .put(`http://localhost:8000/api/v1/users/${updateUser.id}`, updateUser)
        .then((res) => {
          if (res.status === 200) {
            Swal.fire({
              title: "Cập nhật thành công!",
              icon: "success",
              timer: 2000,
            });
            fetchData();
            handleCloseUpdateModal();
          }
          if (res.status === 404) {
            Swal.fire({
              title: "Không tìm thấy student",
              icon: "error",
              timer: 2000,
            });
          }
        })
        .catch((error) => {
          Swal.fire("Lỗi khi cập nhật!", "", "error");
          console.error(error);
        });
    }
  };

  return (
    <Container>
      <Button variant="success" onClick={handleShow} className="mt-4">
        Create Student
      </Button>
      <h1 className="text-center">Student List</h1>
      <Table bordered hover>
        <thead>
          <tr>
            <th onClick={handleSort}>
              ID{" "}
              {sortOrder === "asc" ? (
                <i className="fa-solid fa-arrow-down-short-wide"></i>
              ) : (
                <i className="fa-solid fa-arrow-up-wide-short"></i>
              )}
            </th>
            <th>Name</th>
            <th>Description</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((e, i) => (
            <tr key={i}>
              <td>{e.user_id}</td>
              <td>{e.name}</td>
              <td>{e.description}</td>
              <td className="d-flex justify-content-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleShowUpdateModal(e)}
                >
                  Update
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteUser(e.user_id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create a new student!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isValid ? (
            <></>
          ) : (
            <Alert variant="danger">
              Các ô không để trống và độ dài không quá 255 ký tự
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Name</strong>
              </Form.Label>
              <Form.Control
                type="email"
                name="name"
                onChange={handleChangeCreateUser}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Description</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={handleChangeCreateUser}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={handleSubmitCreate}
            className="w-100"
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isValid ? (
            <></>
          ) : (
            <Alert variant="danger">Các ô không để trống</Alert>
          )}
          <Form onSubmit={handleSubmitUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Name</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={updateUser.name}
                onChange={handleChangeUpdateUser}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Description</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={updateUser.description}
                onChange={handleChangeUpdateUser}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={handleSubmitUpdate}
            className="w-100"
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default HomeComp;
