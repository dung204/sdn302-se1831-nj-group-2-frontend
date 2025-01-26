# SDN302 Project - Frontend

## Table of contents

1. [Authors](#1-authors)
2. [Introduction](#2-introduction)
3. [Pre-requisites](#3-pre-requisites)
4. [Project setup](#4-project-setup)
5. [License](#5-license)

## 1. Authors

This project is developed by Group 2, class SE1831-NJ of the SDN302 (Server-Side development with NodeJS, Express, and MongoDB) subject at FPT University. The group members are:

- Hồ Anh Dũng - HE181529 ([@dung204](https://github.com/dung204))
- Hoàng Gia Trọng - HE172557 ([@tronghghe172557](https://github.com/tronghghe172557))
- Vũ Lương Bảo - HE172612 ([@Baovu2003](https://github.com/Baovu2003))
- Nguyễn Ngọc Anh - HE176642 ([@anhnnhe176642](https://github.com/anhnnhe176642))
- Nguyễn Hữu Tâm - HE187049 ([@Gentle226](https://github.com/Gentle226))

## 2. Introduction

<!-- TODO: Project introduction here -->

## 3. Pre-requisites

You need to setup the backend server before running the frontend. The backend repository can be found [here](https://github.com/dung204/sdn302-se1831-nj-group-2-backend)

For this repository, you need to have the following tools installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/): Latest LTS version (22.13.0) is recommended.
- [pnpm](https://pnpm.io/): The package manager that replaces `npm`.

## 4. Project setup

1. Setup the backend server by following the instructions [here](https://github.com/dung204/sdn302-se1831-nj-group-2-backend?tab=readme-ov-file#4-project-setup)

> Using Docker Compose is recommended.

2. Clone the repository:

```bash
git clone https://github.com/dung204/sdn302-se1831-nj-group-2-frontend.git
```

3. Install dependencies:

```bash
pnpm install --frozen-lockfile
```

> ⚠️ **Note**: The `--frozen-lockfile` is required, since this helps to ensure the `pnpm-lock.yaml` file is not modified during the installation process.

4. Setup the environment variables: Create the `.env` file in the root directory of the project, copy the content from [`.env.example`](.env.example) to it, and fill in the values.

5. Start the development server:

```bash
pnpm start:dev
```

6. The frontend dev server should be running at `http://localhost:5173`

## 5. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
