# LearnFuse

## Project Overview

LearnFuse is an innovative educational technology platform designed to revolutionize learning experiences by addressing a critical gap in traditional educational approaches. Recognizing that students have diverse learning styles (visual, auditory, kinesthetic, and scribble), our application transforms standard textual information into personalized, adaptive learning content. By dynamically converting educational materials into multiple formats, LearnFuse empowers students to engage with content in ways that align with their individual preferences, making learning more accessible, engaging, and effective.

Unlike existing one-size-fits-all educational tools, LearnFuse provides a holistic, adaptable learning experience that:
- Supports multiple learning styles
- Offers personalized content transformation
- Enhances learning accessibility for diverse student populations, including those with learning differences

We currently offer the following features:
- Learning style quiz to recommend the best learning type for users
- Conversion of textual data into various learning formats:
  - Visual: Diagrams and mind maps
  - Auditory: Audio files and video recommendations
  - Kinesthetic: Hands-on learning activity recommendations
  - Scribble: Key point extraction with a text editor for note-taking

For more details, view the full project proposal [here](https://docs.google.com/document/d/1FR3GHlwkUnd_1oKBBvJWxg0UmtsypKB2ClXrJAhlIXw/edit?usp=sharing).

## Group Members and Roles
- **Pritika Aggarwal (pa28)**: 
  - Project Manager, Lead Developer, Tester
  - Learning Type Quiz frontend
  - Kinesthetic frontend
  - Auditory frontend, Text-to-speech backend
  - Privacy Policy Page

- **Shubhi Bhatia (shubhib2)**: 
  - Project Manager, Lead Developer, Tester
  - Home Page
  - Quiz and Contact backend
  - Kinesthetic backend
  - Auditory video recs backend, TTS increased limits

- **Aditya Jindal (ajindal3)**: 
  - UI/UX Designer, Backend Developer, Tester
  - Scribble page
  - Visual backend

- **Prisha Thoguluva (prishat2)**: 
  - UI/UX Designer, Backend Developer, Tester
  - Visual page template, backend
  - Quiz questions, logo design
  - Terms of Service Page

## Technical Architecture

### Technical Architecture Diagram

![Technical Architecture](Docs\tech-arch.png)

### Components Overview

#### Client
Built with HTML, CSS, and JavaScript, comprising pages/sections for:
- Home
- Auditory
- Scribble
- Visual
- Kinesthetic
- Contact

#### Server
The server components are in the `routes/` directory and were built with Node.js and Express.js to handle:
- Video searching
- Text-to-Speech generation
- AI-based content processing (Scribble, Kinesthetic, Visual)
- Email services
- File parsing (PDF, Word, etc.)

#### External Services
- **Groq AI API**: Text analysis and learning material suggestions
- **Vimeo API**: Video recommendations
- **Google TTS API**: Text-to-speech generation
- **FFmpeg**: Audio processing
- **Nodemailer**: Email services
- **PDFParse & Mammoth**: File parsing

## Prerequisites

Before installation, ensure you have the following:
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/CS222-UIUC/main-project-team-38_learn_fuse.git
cd LearnFuse
```

### 2. Environment Configuration
Create a `.env` file in the project root with the following variables:
```
EMAIL_USER=your_gmail_for_nodemailer
EMAIL_PASS=your_app_specific_password_for_EMAIL_USER
GROQ_API_KEY=your_groq_api_key
VIMEO_ACCESS_TOKEN=your_vimeo_access_token
```

**Note on API Keys**: 
- All API keys are free
- No credit card information needed
- Obtain keys directly from respective service providers
   - Groq API - https://console.groq.com/keys
   - Vimeo App Registration and Access Token - https://developer.vimeo.com/apps

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application
```bash
node app.js
```
Visit [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Testing

We use Jest for unit testing. To run the tests:

```
npm test
```

For ESLint and Prettier checks:

```
npm run lint
```

For fixing ESLint and Prettier errors:

```
npm run fix
```

For test coverage reports:

```
npx jest --coverage
```
