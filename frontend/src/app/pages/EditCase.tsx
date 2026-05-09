import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function EditCase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Surgery');
  const [location, setLocation] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [petImage, setPetImage] = useState<File | null>(null);
  const [petImagePreview, setPetImagePreview] = useState<string | null>(null);

  // Load existing case data
  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/cases/${id}`);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setLocation(data.location);
        setGoalAmount(String(data.goalAmount));
        setPetImagePreview(data.image);
      } catch (err) {
        console.error('Failed to load case:', err);
        setLoadError('Failed to load case details. It may have been deleted.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPetImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title || !description || !location || !goalAmount) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const amount = Number(goalAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid goal amount.');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = petImagePreview;

      // 1. Upload new image if selected
      if (petImage) {
        const formData = new FormData();
        formData.append('images', petImage);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.urls?.length) {
          imageUrl = uploadRes.data.urls[0];
        }
      }

      // 2. Update the case
      await api.patch(`/cases/${id}`, {
        title,
        description,
        category,
        location,
        goalAmount: amount,
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      });
      toast.success('Case updated successfully!');
      navigate(`/case/${id}`);
    } catch (err) {
      console.error('Update case failed:', err);
      toast.error('Unable to update case. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading case...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <Link to="/vet/dashboard" className="text-emerald-600 font-semibold hover:text-emerald-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/vet/dashboard"
          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-6"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Edit Case</h1>
          <p className="text-gray-600 mb-6">Update the details of this case.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Case Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Surgery for injured pet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[140px] rounded-2xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Describe the case, medical need, and urgency."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option>Surgery</option>
                  <option>Medical Treatment</option>
                  <option>Rehabilitation</option>
                  <option>Recovery</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="City or clinic location"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Amount (PKR)</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="15000"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {petImagePreview && (
                  <div className="mt-4">
                    <img src={petImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/case/${id}`)}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
