# AMAZOO Backend

Le serveur backend de l'application AMAZOO. C'est la partie de l'application qui s'occupe de la relation avec la base de données et qui fournit des URL pour manipuler les données de l'application.

## Author

- [@MounaSNINI](https://www.linkedin.com/in/mouna-sanai-879b38168/)

## Variables d'environnement

Pour exécuter ce projet, vous devrez ajouter les variables d'environnement suivantes à votre fichier .env

- `JWT_SECRET_DEV`
- `JWT_EXPIRATION`

#### Base des données

- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `DB_HOST`
- `DB_DIALECT`
- `PORT`

#### Mongo URL

- `MONGO_URI`

#### Email

- `EMAIL_SERVICE`
- `EMAIL_ADMIN`
- `EMAIL_SENDER`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

## Exécuter localement

Cloner le projet

```bash
  git clone https://github.com/menoumanouna/amazoo-backend
```

Accédez au répertoire du projet

```bash
  cd amazoo-backend
```

Installer les dépendances

```bash
  yarn install
```

Démarrer le serveur
```bash
  yarn start
```

## Pile technologique

Node, Express, Sequelize

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

