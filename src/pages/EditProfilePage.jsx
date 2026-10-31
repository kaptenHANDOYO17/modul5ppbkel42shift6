import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import userService from '../services/userService'

/**
 * EditProfilePage — halaman terpisah untuk mengubah nama & bio.
 */
export default function EditProfilePage({ onBack, onSaved }) {
  const [profile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Shooter')
  const [bio, setBio] = useState(profile.bio || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Name cannot be empty.')
      return
    }
    const result = userService.saveUserProfile({
      ...profile,
      username: username.trim(),
      bio: bio.trim(),
    })
    if (result.success) onSaved?.('Profile successfully updated.')
    else setError('Failed to save profile.')
  }

  return (
    <div className="page">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Profile
      </button>
      <h1 className="display">Edit profile</h1>
      <p className="lede">Change the name and bio shown on your profile and reviews.</p>

      <form onSubmit={handleSubmit} className="profile-form edit-profile-form">
        <div className="form-group">
          <label htmlFor="prof-name" className="form-label">
            Name / Callsign <span className="req">*</span>
          </label>
          <input
            id="prof-name"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Operator Delta, Master Gunsmith"
            className="form-input"
            maxLength={40}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="prof-bio" className="form-label">Bio</label>
          <textarea
            id="prof-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Qualifications, preferred calibers, unit assignment..."
            rows={4}
            maxLength={280}
            className="form-textarea"
          />
          <span className="form-hint">{bio.length}/280</span>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="cart-actions">
          <button type="button" className="btn btn--outline" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            <Save size={16} /> Save Profile
          </button>
        </div>
      </form>
    </div>
  )
}
