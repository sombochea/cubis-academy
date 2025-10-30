import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trans } from "@lingui/react/macro";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  BookOpen,
} from "lucide-react";
import { ProfileForm } from "@/components/ProfileForm";
import { DotPattern } from "@/components/ui/dot-pattern";
import {
  getProfileBackground,
  getAvatarGradient,
  getInitials,
  getRoleGradient,
  getRoleLabel as getRoleLabelUtil,
  getRoleIcon,
} from "@/lib/avatar-utils";

interface ProfileViewProps {
  user: any;
  roleData: any;
  locale: string;
}

export function ProfileView({ user, roleData, locale }: ProfileViewProps) {
  // Get consistent gradient based on user ID
  const profileBg = getProfileBackground(user.id);
  const avatarGradient = getAvatarGradient(user.id);
  const roleGradient = getRoleGradient(user.role);
  const roleIcon = getRoleIcon(user.role);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return <Trans>Administrator</Trans>;
      case "teacher":
        return <Trans>Teacher</Trans>;
      case "student":
        return <Trans>Student</Trans>;
      default:
        return role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Beautiful Background with Dot Pattern */}
        <div
          className={`relative h-32 bg-gradient-to-br ${profileBg} overflow-hidden`}
        >
          {/* Dot Pattern Overlay */}
          <DotPattern
            width={20}
            height={20}
            cx={1}
            cy={1}
            cr={1}
            className="fill-gray-400/20"
          />
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-transparent" />
        </div>

        {/* Profile Info - Clean white section */}
        <div className="relative px-6 pt-20 pb-8 bg-white">
          {/* Avatar positioned to overlap background */}
          <div className="absolute -top-12 left-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-1 ring-gray-100">
                <AvatarImage
                  src={user.photo || roleData?.photo || undefined}
                  alt={user.name}
                />
                <AvatarFallback
                  className={`bg-gradient-to-br ${avatarGradient} text-white text-2xl font-bold`}
                >
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {/* Role badge */}
              <div
                className={`absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br ${roleGradient} rounded-full flex items-center justify-center text-base shadow-lg border-2 border-white`}
              >
                {roleIcon}
              </div>
            </div>
          </div>

          {/* User info with better spacing */}
          <div className="space-y-3 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-[#17224D] mb-2">
                {user.name}
              </h1>
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex px-3 py-1 bg-gradient-to-r ${roleGradient} rounded-full items-center gap-1.5 shadow-sm`}
                >
                  <Shield className="w-3.5 h-3.5 text-white flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-[#007FFF]" />
              <div>
                <p className="text-xs text-gray-500">
                  <Trans>Email</Trans>
                </p>
                <p className="text-sm font-medium text-[#17224D]">
                  {user.email}
                </p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-[#007FFF]" />
                <div>
                  <p className="text-xs text-gray-500">
                    <Trans>Phone</Trans>
                  </p>
                  <p className="text-sm font-medium text-[#17224D]">
                    {user.phone}
                  </p>
                </div>
              </div>
            )}

            {roleData?.suid && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-[#007FFF]" />
                <div>
                  <p className="text-xs text-gray-500">
                    <Trans>Student ID</Trans>
                  </p>
                  <p className="text-sm font-medium text-[#17224D]">
                    {roleData.suid}
                  </p>
                </div>
              </div>
            )}

            {roleData?.dob && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-[#007FFF]" />
                <div>
                  <p className="text-xs text-gray-500">
                    <Trans>Date of Birth</Trans>
                  </p>
                  <p className="text-sm font-medium text-[#17224D]">
                    {new Date(roleData.dob).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {roleData?.gender && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-[#007FFF]" />
                <div>
                  <p className="text-xs text-gray-500">
                    <Trans>Gender</Trans>
                  </p>
                  <p className="text-sm font-medium text-[#17224D] capitalize">
                    {roleData.gender}
                  </p>
                </div>
              </div>
            )}

            {roleData?.enrolled && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-[#007FFF]" />
                <div>
                  <p className="text-xs text-gray-500">
                    <Trans>Enrolled Since</Trans>
                  </p>
                  <p className="text-sm font-medium text-[#17224D]">
                    {new Date(roleData.enrolled).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {roleData?.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                <MapPin className="w-5 h-5 text-[#007FFF]" />
                <div>
                  <p className="text-xs text-gray-500">
                    <Trans>Address</Trans>
                  </p>
                  <p className="text-sm font-medium text-[#17224D]">
                    {roleData.address}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#007FFF]" />
          <h2 className="text-xl font-semibold text-[#17224D]">
            <Trans>Edit Profile</Trans>
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          <Trans>Update your basic information</Trans>
        </p>
        <ProfileForm user={user} roleData={roleData} locale={locale} />
      </div>
    </div>
  );
}
