const API_URL = 'http://localhost:3000/contacts';

async function fetchContacts() {
    const res = await fetch(API_URL);
    const contacts = await res.json();
    const container = document.getElementById('contacts');
    container.innerHTML = contacts.map(contact => `
        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Phone:</strong> ${contact.phone}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Favorite:</strong> ${contact.is_favorite ? 'Yes' : 'No'}</p>
            <button onclick="markFavorite(${contact.id})">${contact.is_favorite ? 'Unmark Favorite' : 'Mark Favorite'}</button>
            <button onclick="deleteContact(${contact.id})" style="color: red;">Delete</button>
        </div>
    `).join('');
}

document.getElementById('addContactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
    });
    fetchContacts();
});

async function markFavorite(id) {
    await fetch(`${API_URL}/${id}/favorite`, { method: 'PUT' });
    fetchContacts();
}

async function deleteContact(id) {
    const confirmed = confirm('Are you sure you want to delete this contact?');
    if (confirmed) {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Contact deleted successfully');
            fetchContacts();
        } else {
            alert('Failed to delete contact');
        }
    }
}

document.getElementById('exportContacts').addEventListener('click', () => {
    window.location.href = `${API_URL}/export`;
});

document.getElementById('importContactsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('importFile');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const res = await fetch(`${API_URL}/import`, {
        method: 'POST',
        body: formData,
    });

    if (res.ok) {
        alert('Contacts imported successfully');
        fetchContacts();
    } else {
        alert('Failed to import contacts');
    }
});

fetchContacts();

