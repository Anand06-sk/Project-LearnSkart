# LearnSkart: Academic Notes Hub

A lightweight, mobile-responsive platform that provides engineering students with easy access to department-specific notes, question papers, and syllabus materials—hosted entirely on GitHub Pages.

## 📋 Project Description

LearnSkart is an educational resource hub designed for engineering students to access academic materials efficiently. The platform organizes notes and resources by department, regulation, semester, and subject, making it simple to find exactly what you need. All PDF resources are hosted on Google Drive and dynamically loaded through JSON configuration files, ensuring easy maintenance and scalability.

## ✨ Key Features

- **Department-wise Navigation**: Dedicated pages for CSE, ECE, EEE, Mechanical, Civil, and IT departments
- **Smart Filtering**: Filter resources by regulation year, semester, and subject
- **Google Drive Integration**: All PDFs hosted on Google Drive with direct viewing links
- **Dark Mode Support**: Toggle on the home page with site-wide persistence
- **Mobile Responsive**: Fully optimized for smartphones, tablets, and desktop devices
- **Fast & Lightweight**: Pure static site with no backend dependencies
- **CGPA Calculator**: Built-in tool to calculate academic performance
- **Question Papers**: Access to previous year question papers organized by subject
- **Syllabus Access**: Complete syllabus PDFs with semester-wise breakdown

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with responsive design and theme switching
- **Data Management**: JSON files for content configuration
- **Hosting**: GitHub Pages (static hosting)
- **External Storage**: Google Drive for PDF resources

## 📁 Folder Structure

```
Project-LearnSkart/
│
├── index.html                 # Home page
├── README.md                  # Project documentation
├── sitemap.xml                # Sitemap for GitHub Pages
│
├── assets/
│   ├── css/                   # Stylesheets
│   │   ├── style.css          # Main stylesheet
│   │   ├── theme.css          # Dark mode theme
│   │   ├── Deptstyle.css      # Department page styles
│   │   ├── pdfs.css           # Study notes listing styles
│   │   ├── question.css       # Question paper styles
│   │   ├── syllabus.css       # Syllabus page styles
│   │   └── ...                # Other component styles
│   │
│   ├── data/                  # JSON data files
│   │   ├── data.json          # Notes and PDF links
│   │   ├── qn.json            # Question paper data
│   │   └── sydata.json        # Syllabus data
│   │
│   ├── icons/                 # Favicons and manifest
│   │
│   └── js/                    # JavaScript modules
│       ├── script.js          # Main application logic
│       ├── Deptscript.js      # Department page logic
│       ├── pdfs.js            # Study notes listing handler
│       ├── populate-pyq.js    # Question paper handler
│       ├── syllabus.js        # Syllabus handler
│       ├── theme.js           # Dark mode persistence/toggle
│       └── ...                # Other utilities
│
├── academics/                 # Department pages
│   ├── cse/                   # CSE department page
│   ├── ece/                   # ECE department page
│   ├── eee/                   # EEE department page
│   ├── mech/                  # Mechanical department page
│   ├── civil/                 # Civil department page
│   └── it/                    # IT department page
│
├── syllabus/                  # Syllabus pages
│   ├── index.html             # Syllabus landing page
│   └── pdfs.html              # Syllabus PDF list page
│
├── study-notes/               # Study notes listing page
├── previous-year-questions/   # Question papers page
├── gate-pyqs/                 # GATE PYQs page
├── cgpa-calculator/           # CGPA calculator page
├── about/                     # About page
├── privacy/                   # Privacy policy
└── disclaimer/                # Content disclaimer
```

## ⚙️ How It Works (Google Drive + JSON)

The platform uses a simple yet effective architecture:

1. **PDF Storage**: All notes, question papers, and syllabus files are uploaded to Google Drive with public viewing permissions.

2. **JSON Configuration**: Three main JSON files manage the content:
   - [assets/data/data.json](assets/data/data.json): Contains links to notes PDFs organized by department, regulation, semester, and subject
   - [assets/data/qn.json](assets/data/qn.json): Stores question paper links with metadata
   - [assets/data/sydata.json](assets/data/sydata.json): Manages syllabus documents

3. **Dynamic Rendering**: JavaScript fetches the JSON data and dynamically populates the pages with:
   - Department-specific filters
   - Regulation and semester dropdowns
   - Subject-wise PDF cards with direct Google Drive links

4. **Client-Side Logic**: All filtering, searching, and rendering happens in the browser—no server required.

5. **Easy Updates**: To add new resources, simply:
   - Upload the PDF to Google Drive
   - Copy the shareable link
   - Add an entry to the appropriate JSON file
   - Push changes to GitHub

## 🌐 Live Website

**GitHub Pages**: [https://anand06-sk.github.io/Project-LearnSkart/](https://anand06-sk.github.io/Project-LearnSkart/)

## 🚀 Usage Instructions

### For Users:
1. Visit the live website or clone the repository
2. Navigate to your department page from the home screen
3. Select your regulation, semester, and subject
4. Click on any PDF card to view or download the resource
5. Use the dark mode toggle for comfortable reading
6. Check the calculator page to compute your CGPA

### For Developers:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/anand06-sk/Project-LearnSkart.git
   cd Project-LearnSkart
   ```

2. **Run locally**:
   - Open [index.html](index.html) directly in a browser, or
   - Use a local server:
     ```bash
     python -m http.server 8000
     ```
   - Navigate to `http://localhost:8000`

3. **Update content**:
   - Upload new PDFs to Google Drive
   - Get the shareable link and ensure viewing permissions are set to "Anyone with the link"
   - Edit the appropriate JSON file in [assets/data/](assets/data/)
   - Commit and push changes to GitHub

4. **Deploy**:
   - GitHub Pages automatically deploys from the main branch
   - Changes go live within a few minutes

## 🔮 Future Improvements

- **Global Search**: Search functionality across all departments and subjects
- **Offline Support**: Progressive Web App (PWA) with caching for offline access
- **User Authentication**: Allow students to bookmark and track their progress
- **Admin Panel**: Web-based interface to manage JSON files without manual editing
- **Analytics Dashboard**: Track most accessed resources and user engagement
- **Contribution System**: Allow verified users to submit new resources
- **Enhanced Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Print-Friendly Views**: Optimized layouts for printing study materials
- **Multi-language Support**: Interface translation for regional languages

## 📜 Disclaimer

This platform is created **solely for educational purposes** to help engineering students access academic resources. 

- All PDF materials are hosted on Google Drive and are publicly available
- **Copyright**: Ownership of all documents remains with the original authors, publishers, and educational institutions
- If you are a copyright holder and wish to have content removed, please contact the repository maintainer
- This project does not claim ownership of any educational content shared on the platform
- Users are encouraged to respect copyright laws and use materials responsibly

## 📧 Contact & Contributions

Contributions and feature requests are welcome! Feel free to reach out to the repository maintainer.

## 👥 Contributors

Thanks to these wonderful people who have contributed to this project:

### Main Contributors
- [@Anand06-sk](https://github.com/Anand06-sk)
- [@AnuN2006](https://github.com/AnuN2006)

---

**Made with ❤️ for engineering students** | [LearnSkart](https://github.com/anand06-sk/Project-LearnSkart)
