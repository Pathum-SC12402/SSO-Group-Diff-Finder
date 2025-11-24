Here is the updated **README.md** with your exact folder structure and only the required `.gitignore` rule.

---

# **SSO Group Comparator Tool**

This tool allows you to download AWS IAM Identity Center (SSO) group lists, compare them, filter unwanted groups, and export the final cleaned list. It works entirely in the browser with no backend required.

---

## **📁 Project Structure**

```
sso-group-comparator/
│
├── index.html
├── styles.css
└── app.js
```

---

# **1. Download SSO Groups as JSON**

Use the following PowerShell commands to download the list of all SSO groups as `sso-groups.json`.

### **Step 1 — Open PowerShell**

Open PowerShell in the directory where you want to download the SSO group list.

### **Step 2 — Set AWS Credentials**

Either run:

```powershell
aws configure
```

or set environment variables manually:

```powershell
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
$env:AWS_SESSION_TOKEN="YOUR_SESSION_TOKEN"   # Only for temporary credentials
```

### **Step 3 — Set Your AWS Region**

```powershell
# 1. Set your AWS region
$Region="ap-southeast-1"
```

### **Step 4 — Get the IdentityStoreId**

```powershell
# 2. Get the IdentityStoreId
$IdStore=$(aws sso-admin list-instances --region $Region --query "Instances[0].IdentityStoreId" --output text)
```

### **Step 5 — Download All SSO Groups**

```powershell
# 3. Download all groups as JSON
aws identitystore list-groups --identity-store-id $IdStore --region $Region --output json > sso-groups.json
```

This file is used in **Step 1** of the tool.

---

# **2. Using the Web Tool**

### **Step 1 — Load Source Groups**

* Upload the generated `sso-groups.json`
* Click **Load Source Groups**

### **Step 2 — Compare With Another List**

* Paste comparison list (one group per line)
* Click **Find Additional Groups (Step 2)**

### **Step 3 — Apply Ignore File (Optional)**

* Upload `.txt` file containing groups to ignore
* Click **Apply Ignore Filter (Step 3)**

### **Step 4 — Download Output**

Click **Download Final List (.txt)** to save results.

---

# **3. .gitignore**

Create a `.gitignore` file with:

```
# Ignore JSON files
*.json
```

This prevents local SSO group data from being committed to the repository.
